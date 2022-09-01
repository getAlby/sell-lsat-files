package main

import (
	"context"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/btcsuite/btcd/chaincfg"
	"github.com/esimov/stackblur-go"
	"github.com/getAlby/lsat-middleware/ginlsat"
	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
	"github.com/lightningnetwork/lnd/lnrpc"
	"github.com/lightningnetwork/lnd/zpay32"
	"github.com/mcnijman/go-emailaddress"
	"github.com/sirupsen/logrus"
	"github.com/xeonx/timeago"
	"google.golang.org/grpc"
	"gorm.io/gorm"
)

const (
	MSAT_PER_SAT = 1000
)

type Config struct {
	DatabaseUrl  string `envconfig:"DATABASE_URL" required:"true"`
	AssetDirName string `envconfig:"ASSET_DIR_NAME" default:"assets"`
	StaticDir    string `envconfig:"STATIC_DIR_NAME" default:"static"`
	Scheme       string `envconfig:"SCHEME" default:"https"`
}
type Service struct {
	DB     *gorm.DB
	Config *Config
}

func (svc *Service) Index(c *gin.Context) {
	sortBy := c.Query("sort_by")
	if sortBy == "" {
		sortBy = "created_at"
	}
	resp, err := svc.getMetadata(c, fmt.Sprintf("%s desc", sortBy), &UploadedFileMetadata{})
	if err != nil {
		c.String(http.StatusInternalServerError, "Something went wrong")
	}
	c.JSON(http.StatusOK, resp)
}

func (svc *Service) ListAccounts(c *gin.Context) {
	type result struct {
		Earned    int
		Count     int
		LNAddress string
	}
	sortBy := c.Query("sort_by")
	if sortBy == "" {
		sortBy = "earned"
	}
	resultList := []result{}
	err := svc.DB.Select("SUM(sats_earned) as earned, COUNT(*), ln_address").Order(fmt.Sprintf("%s desc", sortBy)).Group("ln_address").Table("uploaded_file_metadata").Find(&resultList).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		c.String(http.StatusInternalServerError, "Something went wrong")
		return
	}
	c.JSON(http.StatusOK, resultList)
}

func (svc *Service) SearchAccounts(c *gin.Context) {
	lnAddress := c.Query("ln_address")
	type result struct {
		Earned    int
		Count     int
		LNAddress string
	}
	sortBy := c.Query("sort_by")
	if sortBy == "" {
		sortBy = "created_at"
	}
	resultList := []result{}
	err := svc.DB.Select("sum(sats_earned) as earned, COUNT(*), ln_address").Where("ln_address like %?%", lnAddress).Order(fmt.Sprintf("%s des", sortBy)).Group("ln_address").Table("uploaded_file_metadata").Find(&resultList).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		c.String(http.StatusInternalServerError, "Something went wrong")
		return
	}
	c.JSON(http.StatusOK, resultList)
}

func (svc *Service) AccountIndex(c *gin.Context) {
	accountName, found := c.Params.Get("account")
	if !found {
		c.String(http.StatusNotFound, "No account parameter")
		return
	}
	sortBy := c.Query("sort_by")
	if sortBy == "" {
		sortBy = "created_at"
	}
	resp, err := svc.getMetadata(c, fmt.Sprintf("%s desc", sortBy), &UploadedFileMetadata{
		LNAddress: accountName,
	})
	if err != nil {
		c.String(http.StatusInternalServerError, "Something went wrong")
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (svc *Service) getMetadata(c *gin.Context, query string, search *UploadedFileMetadata) (response []IndexResponseEntry, err error) {
	entries := []UploadedFileMetadata{}
	err = svc.DB.Order(query).Find(&entries, search).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}
	response = []IndexResponseEntry{}

	for _, e := range entries {
		//switch order, newest first
		response = append(response, svc.convertResponse(e, c))
	}
	return response, nil
}

func (svc *Service) convertResponse(e UploadedFileMetadata, c *gin.Context) IndexResponseEntry {
	return IndexResponseEntry{
		Id:            e.ID,
		CreatedAt:     e.CreatedAt,
		TimeAgo:       timeago.English.Format(e.CreatedAt),
		URL:           fmt.Sprintf("%s://%s/assets/%s", svc.Config.Scheme, c.Request.Host, e.Name),
		Name:          e.OriginalName,
		LNAddress:     e.LNAddress,
		Price:         e.Price,
		NrOfDownloads: e.NrOfDownloads,
		SatsEarned:    e.SatsEarned,
		Currency:      e.Currency,
	}
}

func (svc *Service) UpdateFileMetadata(filename string) error {
	fetched := &UploadedFileMetadata{}
	err := svc.DB.First(fetched, &UploadedFileMetadata{
		Name: filename,
	}).Error
	if err != nil {
		return err
	}
	fetched.NrOfDownloads += 1
	//not fiat-proof, todo: fix
	fetched.SatsEarned += fetched.Price
	return svc.DB.Save(fetched).Error
}

func (svc *Service) AssetHandler(c *gin.Context) {
	lsatInfo := c.Value("LSAT").(*ginlsat.LsatInfo)
	if lsatInfo.Type == ginlsat.LSAT_TYPE_ERROR {
		logrus.Errorf("lsat error: %s for path %s", lsatInfo.Error, c.Request.URL.Path)
	}
	if lsatInfo.Type == ginlsat.LSAT_TYPE_PAID {
		c.File(fmt.Sprintf("%s/paid/%s", svc.Config.AssetDirName, c.Param("file")))
		go svc.UpdateFileMetadata(c.Param("file"))
		return
	}
	c.File(fmt.Sprintf("%s/free/%s", svc.Config.AssetDirName, c.Param("file")))
}

func (svc *Service) BlurImg(filepath string) error {
	imagePath, _ := os.Open(filepath)
	defer imagePath.Close()
	srcImage, _, _ := image.Decode(imagePath)
	result, err := stackblur.Process(srcImage, 100)
	if err != nil {
		return err
	}
	newImage, _ := os.Create(strings.Replace(filepath, "/paid", "/free", 1))
	defer newImage.Close()
	return jpeg.Encode(newImage, result, &jpeg.Options{Quality: jpeg.DefaultQuality})
}

func (svc *Service) Uploadfile(c *gin.Context) {
	// single file
	file, _ := c.FormFile("file")
	lnaddress := c.Request.FormValue("ln_address")
	price, err := strconv.Atoi(c.Request.FormValue("price"))
	if err != nil {
		c.String(http.StatusBadRequest, "Price in sats needs to be specified")
		return
	}
	if lnaddress == "" || price <= 0 || file == nil {
		c.String(http.StatusBadRequest, "ln address, price and file must be set")
		return
	}
	_, err = FindLNAddress(lnaddress)
	if err != nil {
		c.String(http.StatusBadRequest, fmt.Sprintf("Invalid LN Address: %s", lnaddress))
		return
	}
	uuid, err := uuid.NewV4()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	if lnaddress == "" || price <= 0 || file == nil {
		c.String(http.StatusBadRequest, "ln address, price and file must be set")
		return
	}
	totalName := uuid.String() + "_" + file.Filename
	svc.DB.Create(&UploadedFileMetadata{
		LNAddress:    lnaddress,
		Name:         totalName,
		OriginalName: file.Filename,
		Price:        price,
		Currency:     "BTC",
	})
	// Upload the file to specific dst.
	err = c.SaveUploadedFile(file, fmt.Sprintf("%s/paid/%s", svc.Config.AssetDirName, totalName))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	//blur the file and save the blurred file as well
	err = svc.BlurImg(fmt.Sprintf("%s/paid/%s", svc.Config.AssetDirName, totalName))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, map[string]string{
		"msg": "File succesfully uploaded. You can close this page.",
		"url": fmt.Sprintf("https://%s/assets/%s", c.Request.Host, totalName),
	})
}
func (svc *Service) AddInvoice(ctx context.Context, lnReq *lnrpc.Invoice, httpReq *http.Request, options ...grpc.CallOption) (*lnrpc.AddInvoiceResponse, error) {
	fetched := &UploadedFileMetadata{}
	name := strings.TrimPrefix(httpReq.URL.Path, "/assets/")
	if name == "" {
		return nil, fmt.Errorf("no filename specified")
	}
	err := svc.DB.First(fetched, &UploadedFileMetadata{
		Name: name,
	}).Error
	if err != nil {
		return nil, err
	}
	resp, err := FindLNAddress(fetched.LNAddress)
	if err != nil {
		return nil, err
	}
	inv, err := FetchInvoice(resp.Callback, fmt.Sprintf("LSAT invoice for file %s", fetched.Name), int(fetched.Price))
	if err != nil {
		return nil, err
	}
	decoded, err := zpay32.Decode(inv, &chaincfg.MainNetParams)
	if err != nil {
		return nil, err
	}
	return &lnrpc.AddInvoiceResponse{
		RHash:          decoded.PaymentHash[:],
		PaymentRequest: inv,
	}, nil
}

func FindLNAddress(input string) (response *LNURLPayResponse, err error) {
	emails := emailaddress.Find([]byte(input), false)
	for _, e := range emails {
		url := constructLNURL(e.LocalPart, e.Domain)
		resp, err := http.Get(url)
		if err != nil {
			return nil, err
		}
		payload := &LNURLPayResponse{}
		err = json.NewDecoder(resp.Body).Decode(&payload)
		if err != nil {
			return nil, err
		}
		if payload.Callback != "" {
			return payload, nil
		}
	}

	return nil, fmt.Errorf("Not a LN Address %s", input)
}

func constructLNURL(user, host string) (result string) {
	return fmt.Sprintf("https://%s/.well-known/lnurlp/%s", host, user)
}

func FetchInvoice(callback, comment string, satAmt int) (invoice string, err error) {
	if err != nil {
		return "", err
	}
	parsed, err := url.Parse(callback)
	if err != nil {
		return "", err
	}
	q := parsed.Query()
	q.Set("amount", strconv.Itoa(satAmt*MSAT_PER_SAT))
	q.Set("comment", comment)
	parsed.RawQuery = q.Encode()
	url := parsed.String()
	fmt.Println(url)
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	payload := &SecondaryLNURLPayResponse{}
	err = json.NewDecoder(resp.Body).Decode(payload)
	if err != nil {
		return "", err
	}

	return payload.Invoice, nil
}

type LNURLPayResponse struct {
	Callback    string `json:"callback"`
	MaxSendable int    `json:"maxSendable"`
	Metadata    string `json:"metadata"`
	MinSendable int    `json:"minSendable"`
	Tag         string `json:"tag"`
}

type SecondaryLNURLPayResponse struct {
	Invoice string `json:"pr"`
}
