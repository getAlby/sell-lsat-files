package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/getAlby/lsat-middleware/caveat"
	"github.com/getAlby/lsat-middleware/ginlsat"
	lsatmw "github.com/getAlby/lsat-middleware/middleware"
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
	err = db.AutoMigrate(&UploadedFileMetadata{}, &Payment{})
	if err != nil {
		log.Fatal(err)
	}
	// The session the S3 Uploader will use
	sess, err := session.NewSession(&aws.Config{
		Credentials: credentials.NewStaticCredentials(c.S3Key, c.S3Secret, ""),
		Endpoint:    aws.String("https://fra1.digitaloceanspaces.com"),
		Region:      aws.String("us-east-1"),
	})
	if err != nil {
		log.Fatal(err)
	}
	s3Client := s3.New(sess)

	svc := &Service{
		S3Client: s3Client,
		DB:       db,
		Config:   c,
	}

	//we are not using a predefined mw, but a custom one (svc is the ln client)
	lsatmiddleware := lsatmw.LsatMiddleware{}
	lsatmiddleware.LNClient = svc
	lsatmiddleware.AmountFunc = func(req *http.Request) (amount int64) {
		//dummy, this will get overwritten by the LNClient anyway
		return 1
	}
	lsatmiddleware.CaveatFunc = PathCaveat
	ginLsat := &ginlsat.GinLsat{
		Middleware: lsatmiddleware,
	}

	paid := router.Group("/assets", ginLsat.Handler, cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET"},
		AllowHeaders:    []string{"Accept", "Authorization", "Accept-Authenticate"},
		ExposeHeaders:   []string{"www-authenticate"},
	}))

	router.Use(cors.Default())

	paid.GET("/:file", svc.AssetHandler)

	//API
	//redundant routes, old ones to be deleted later
	router.GET("/api/index", svc.Index)
	router.POST("/api/upload", svc.Uploadfile)
	router.GET("/api/accounts/:account", svc.AccountIndex)
	router.GET("/api/accounts/search", svc.SearchAccounts)
	router.GET("/api/accounts", svc.ListAccounts)

	router.GET("/", func(ctx *gin.Context) {
		ctx.Header("Content-Type", "text/html")
		ctx.String(http.StatusOK, svc.Config.DefaultMsg)
	})
	log.Fatal(router.Run(":8080"))
}

func PathCaveat(req *http.Request) []caveat.Caveat {
	return []caveat.Caveat{
		{
			Condition: "REQUEST_PATH",
			Value:     req.URL.Path,
		},
	}
}
