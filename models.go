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

type Payment struct {
	gorm.Model
	Name        string
	PaymentHash string
	Preimage    string
}

type IndexResponseEntry struct {
	Id            uint
	CreatedAt     time.Time
	TimeAgo       string
	URL           string
	Name          string
	LNAddress     string
	Price         int
	NrOfDownloads int
	SatsEarned    int
	Currency      string
}
