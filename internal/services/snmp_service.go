package services

import (
	"net"
	"github.com/dinonomous/SamsungNeBackend/internal/models"
	"github.com/gosnmp/gosnmp"
	"log"
	"time"
	"fmt"
)

func FetchSnmpData(ipAddress string, community string, version gosnmp.SnmpVersion, encryptionType string, securityLevel string, logOid string) ([]string, error) {
	snmp := &gosnmp.GoSNMP{
		Target:    ipAddress,
		Port:      161,
		Version:   version,
		Community: community,
		Timeout:   time.Duration(2) * time.Second,
	}

	err := snmp.Connect()
	if err != nil {
		log.Printf("Error connecting to SNMP target: %v", err)
		return nil, err
	}
	defer snmp.Conn.Close()

	// Perform a GETBULK operation to fetch multiple log entries
	result, err := snmp.BulkWalkAll(logOid)
	if err != nil {
		log.Printf("Error fetching SNMP logs: %v", err)
		return nil, err
	}

	var logs []string
	for _, variable := range result {
		if variable.Type == gosnmp.OctetString {
			logs = append(logs, string(variable.Value.([]byte)))
		}
	}

	if len(logs) == 0 {
		return nil, fmt.Errorf("No log data found for OID: %s", logOid)
	}

	return logs, nil
}

func GetNetworkInfo() ([]models.NetworkInfo, error) {
	var networkInfos []models.NetworkInfo
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}

	for _, iface := range interfaces {

		addrs, err := iface.Addrs()
		if err != nil {
			return nil, err
		}

		for _, addr := range addrs {
			ipNet, ok := addr.(*net.IPNet)
			if ok && ipNet.IP.To4() != nil {
				networkInfos = append(networkInfos, models.NetworkInfo{
					InterfaceName: iface.Name,
					IP:           ipNet.IP.String(),
					Subnet:       ipNet.Mask.String(),
					HardwareAddr: iface.HardwareAddr.String(),
					Status:       iface.Flags.String(), // Interface status
					MTU:          iface.MTU,
					Broadcast:    ipNet.IP.Mask(ipNet.Mask).String(), // Broadcast address
					NetworkType:  "IPv4", // Assuming IPv4, can add checks for IPv6
					// Add logic for gateway and description if needed
				})				
			}
		}
	}

	return networkInfos, nil
}