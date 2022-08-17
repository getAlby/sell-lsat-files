package main

import "gorm.io/gorm"

type UploadedFileMetadata struct {
	gorm.Model
	LNAddress    string
	Name         string
	OriginalName string
	Price        int
	Currency     string
}

type IndexResponseEntry struct {
	URL       string
	Name      string
	LNAddress string
	Price     int
	Currency  string
}
