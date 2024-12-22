package services

import (
	"net"
	"github.com/dinonomous/SamsungNeBackend/internal/models"
	"github.com/gosnmp/gosnmp"
	"log"
	"time"
	"fmt"
)

func FetchSnmpData(ipAddress string, community string, version gosnmp.SnmpVersion, encryptionType string, securityLevel string, oid string) (string, error) {
	snmp := &gosnmp.GoSNMP{
		Target:    ipAddress,           // IP Address of the target device
		Port:      161,                  // Default SNMP port
		Version:   version,              // SNMP version (e.g., SNMPv2c, SNMPv3)
		Community: community,            // Community string for SNMPv2c
		Timeout:   time.Duration(2) * time.Second,
	}

	err := snmp.Connect()
	if err != nil {
		log.Printf("Error connecting to SNMP target: %v", err)
		return "", err
	}
	defer snmp.Conn.Close()

	result, err := snmp.Get([]string{oid})
	if err != nil {
		log.Printf("Error fetching SNMP data: %v", err)
		return "", err
	}

	if len(result.Variables) > 0 {
		return fmt.Sprintf("SNMP Data: %v", result.Variables[0].Value), nil
	}

	return "", fmt.Errorf("No SNMP data found")
}

func GetNetworkInfo() ([]models.NetworkInfo, error) {
	var networkInfos []models.NetworkInfo

	// Get a list of all network interfaces
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
			// Check if the address is an IPv4 address
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