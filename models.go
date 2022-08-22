package main

import (
	"time"

	"gorm.io/gorm"
)

type UploadedFileMetadata struct {
	gorm.Model
	Id						int
	LNAddress 		string
	Name					string
	OriginalName	string
	Price 				int
	NrOfDownloads int
	SatsEarned		int
	Currency			string
}

type IndexResponseEntry struct {
	Id						int
	CreatedAt 		time.Time
	TimeAgo 			string
	URL 					string
	Name					string
	LNAddress 		string
	Price 				int
	NrOfDownloads int
	SatsEarned		int
	Currency			string
}
