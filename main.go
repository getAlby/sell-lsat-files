package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/getAlby/lsat-middleware/ginlsat"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	router := gin.Default()
	c := &Config{}
	// Load configruation from environment variables
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Failed to load .env file")
	}
	err = envconfig.Process("", c)
	if err != nil {
		log.Fatalf("Error loading environment variables: %v", err)
	}

	db, err := gorm.Open(postgres.Open(c.DatabaseUrl))
	if err != nil {
		log.Fatal(err)
	}
	logrus.Info("Opened database")
	err = db.AutoMigrate(&UploadedFileMetadata{})
	if err != nil {
		log.Fatal(err)
	}
	svc := &Service{
		DB:     db,
		Config: c,
	}
	//create free and paid dirs
	err = os.MkdirAll(fmt.Sprintf("%s/free", svc.Config.AssetDirName), os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}
	err = os.MkdirAll(fmt.Sprintf("%s/paid", svc.Config.AssetDirName), os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}

	//we are not using a predefined mw, but a custom one (svc is the ln client)
	lsatmiddleware := &ginlsat.GinLsatMiddleware{}
	lsatmiddleware.LNClient = svc
	lsatmiddleware.AmountFunc = func(req *http.Request) (amount int64) {
		//dummy, this will get overwritten by the LNClient anyway
		return 1
	}

	paid := router.Group("/assets", lsatmiddleware.Handler, cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET"},
		AllowHeaders:    []string{"Accept", "Authorization"},
	}))

	router.Use(cors.Default())

	paid.GET("/:file", svc.AssetHandler)
	router.POST("/upload", svc.Uploadfile)
	router.GET("/index", svc.Index)
	router.StaticFile("/", "frontend/build/index.html")
	router.StaticFile("/logo.png", "frontend/build/logo.png")
	router.StaticFS("/static/", gin.Dir("frontend/build/static", false))

	//API
	//redundant routes, old ones to be deleted later
	router.GET("/api/index", svc.Index)
	router.POST("/api/upload", svc.Uploadfile)
	router.GET("/api/accounts/:account", svc.AccountIndex)
	router.GET("/api/accounts/search", svc.SearchAccounts)
	router.GET("/api/accounts", svc.ListAccounts)
	log.Fatal(router.Run(":8080"))
}
