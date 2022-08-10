package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/kiwiidb/gin-lsat/ginlsat"
	"github.com/kiwiidb/gin-lsat/ln"
)

const SATS_PER_BTC = 100000000

const MIN_SATS_TO_BE_PAID = 1

type FiatRateConfig struct {
	Currency string
	Amount   float64
}

func (fr *FiatRateConfig) FiatToBTCAmountFunc(req *http.Request) (amount int64) {
	if req == nil {
		return MIN_SATS_TO_BE_PAID
	}
	res, err := http.Get(fmt.Sprintf("https://blockchain.info/tobtc?currency=%s&value=%f", fr.Currency, fr.Amount))
	if err != nil {
		return MIN_SATS_TO_BE_PAID
	}
	defer res.Body.Close()

	amountBits, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return MIN_SATS_TO_BE_PAID
	}
	amountInBTC, err := strconv.ParseFloat(string(amountBits), 32)
	if err != nil {
		return MIN_SATS_TO_BE_PAID
	}
	amountInSats := SATS_PER_BTC * amountInBTC
	return int64(amountInSats)
}

func main() {
	router := gin.Default()
	lnClientConfig := &ln.LNClientConfig{
		LNClientType: "LNURL",
		LNURLConfig: ln.LNURLoptions{
			Address: os.Getenv("LNURL_ADDRESS"),
		},
	}
	fr := &FiatRateConfig{
		Currency: "USD",
		Amount:   0.50,
	}
	lsatmiddleware, err := ginlsat.NewLsatMiddleware(lnClientConfig, fr.FiatToBTCAmountFunc)
	if err != nil {
		log.Fatal(err)
	}

	paid := router.Group("/assets", lsatmiddleware.Handler, checkLsatPaidHandler)
	paid.Static("/assets", "./assets").Use()
	router.POST("/upload", func(c *gin.Context) {
		// single file
		file, _ := c.FormFile("file")
		log.Println(file.Filename)

		// Upload the file to specific dst.
		err = c.SaveUploadedFile(file, fmt.Sprintf("assets/%s", file.Filename))
		if err != nil {
			c.JSON(http.StatusInternalServerError, err.Error())
		}

		c.String(http.StatusOK, fmt.Sprintf("'%s' uploaded!", file.Filename))
	})

	log.Fatal(router.Run("localhost:8080"))
}

func checkLsatPaidHandler(c *gin.Context) {
	lsatInfo := c.Value("LSAT").(*ginlsat.LsatInfo)
	if lsatInfo.Type != ginlsat.LSAT_TYPE_PAID {
		c.AbortWithStatusJSON(http.StatusPaymentRequired, gin.H{
			"code":    http.StatusPaymentRequired,
			"message": "There is no free content, pay up",
		})
	}
}
