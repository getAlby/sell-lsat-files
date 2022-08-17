package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/getAlby/gin-lsat/ginlsat"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	router := gin.Default()

	db, err := gorm.Open(postgres.Open(os.Getenv("DATABASE_URL")))
	if err != nil {
		log.Fatal(err)
	}
	logrus.Info("Opened database")
	err = db.AutoMigrate(&UploadedFileMetadata{})
	if err != nil {
		log.Fatal(err)
	}
	svc := &Service{
		DB: db,
		Config: &Config{
			AssetDirName: os.Getenv("ASSET_DIR_NAME"),
		},
	}
	//we are not using a predefined mw, but a custom one (svc is the ln client)
	lsatmiddleware := &ginlsat.GinLsatMiddleware{}
	lsatmiddleware.LNClient = svc
	lsatmiddleware.AmountFunc = func(req *http.Request) (amount int64) {
		//dummy, this will get overwritten by the LNClient anyway
		return 1
	}

	paid := router.Group("/assets", lsatmiddleware.Handler, checkLsatPaidHandler)
	paid.Static("/", svc.Config.AssetDirName)
	router.POST("/upload", svc.Uploadfile)
	router.GET("/index", svc.Listfiles)

	log.Fatal(router.Run(":8080"))
}

func checkLsatPaidHandler(c *gin.Context) {
	lsatInfo := c.Value("LSAT").(*ginlsat.LsatInfo)
	fmt.Println(lsatInfo)
	if lsatInfo.Type != ginlsat.LSAT_TYPE_PAID {
		c.AbortWithStatusJSON(http.StatusPaymentRequired, gin.H{
			"code":    http.StatusPaymentRequired,
			"message": "There is no free content, pay up",
		})
	}
}
