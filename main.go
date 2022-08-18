package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/getAlby/gin-lsat/ginlsat"
	"github.com/gin-contrib/cors"
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
			StaticDir:    os.Getenv("STATIC_DIR_NAME"),
		},
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
	paid.GET("/:file", svc.AssetHandler)
	router.POST("/upload", svc.Uploadfile)
	router.LoadHTMLGlob("static/*.html")
	router.GET("/", svc.Home)
	router.Static("/static", "static/css")

	log.Fatal(router.Run(":8080"))
}
