package main

import (
	"time"

	"gorm.io/gorm"
)

type UploadedFileMetadata struct {
	gorm.Model
	LNAddress     string
	Name          string
	OriginalName  string
	Price         int
	NrOfDownloads int
	SatsEarned    int
	Currency      string
}

type IndexResponseEntry struct {
	CreatedAt     time.Time
	URL           string
	Name          string
	LNAddress     string
	Price         int
	NrOfDownloads int
	SatsEarned    int
	Currency      string
}
