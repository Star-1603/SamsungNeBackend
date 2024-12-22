package main

import (
    "github.com/dinonomous/SamsungNeBackend/internal/handlers"
	"fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/snmp", handlers.SnmpHandler)
	http.HandleFunc("/network-info", handlers.NetworkInfoHandler)

    port := ":8081"
	fmt.Printf("Server running on http://localhost%s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}
