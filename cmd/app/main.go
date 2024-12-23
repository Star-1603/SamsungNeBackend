package main

import (
	"fmt"
	"net/http"
	"github.com/dinonomous/SamsungNeBackend/internal/handlers"
	"github.com/dinonomous/SamsungNeBackend/internal/threads"
)

func main() {
	http.HandleFunc("/snmp", handlers.SnmpHandler)

	go threads.StartSnmpTrapListener()
	go threads.StartSyslogListener()

	port := ":8081"
	fmt.Printf("Server running on http://localhost%s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}
