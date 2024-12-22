package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/dinonomous/SamsungNeBackend/internal/services"
	"github.com/gosnmp/gosnmp"
	"log"
	"net/http"
)

func SnmpHandler(w http.ResponseWriter, r *http.Request) {
	ipAddress := r.URL.Query().Get("ip")                // Example: ?ip=192.168.1.1
	community := r.URL.Query().Get("community")         // Example: ?community=public
	versionStr := r.URL.Query().Get("version")          // Example: ?version=2
	encryptionType := r.URL.Query().Get("encryption")   // Example: ?encryption=none
	securityLevel := r.URL.Query().Get("securityLevel") // Example: ?securityLevel=noAuthNoPriv

	if ipAddress == "" {
		http.Error(w, "IP address is required", http.StatusBadRequest)
		return
	}

	if versionStr == "" {
		versionStr = "2" // Default to SNMPv2c (integer version)
	}

	var version gosnmp.SnmpVersion
	switch versionStr {
	case "1":
		version = gosnmp.Version1
	case "2":
		version = gosnmp.Version2c
	case "3":
		version = gosnmp.Version3
	default:
		http.Error(w, fmt.Sprintf("Invalid SNMP version: %v", versionStr), http.StatusBadRequest)
		return
	}

	data, err := services.FetchSnmpData(ipAddress, community, version, encryptionType, securityLevel, "1.3.6.1.2.1.1.6.0")
	if err != nil {
		log.Printf("Error fetching SNMP data: %v", err)
		http.Error(w, fmt.Sprintf("Error fetching SNMP data: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(data))
}

func NetworkInfoHandler(w http.ResponseWriter, r *http.Request) {
	networkInfos, err := services.GetNetworkInfo()
	if err != nil {
		http.Error(w, fmt.Sprintf("Error retrieving network info: %v", err), http.StatusInternalServerError)
		return
	}

	if len(networkInfos) == 0 {
		http.Error(w, "No network information available", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(networkInfos)
}
