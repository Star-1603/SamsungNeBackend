package main

import (
    "github.com/dinonomous/SamsungNeBackend/internal/handlers"
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/snmp", handlers.SnmpHandler)
    log.Println("Starting server on :8080...")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
