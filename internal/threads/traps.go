package threads

import (
	"fmt"
	"log"
	"net"
	"github.com/gosnmp/gosnmp"
)

func StartSnmpTrapListener() {
    listener := gosnmp.NewTrapListener()
    listener.OnNewTrap = handleTrap
    listener.Params = gosnmp.Default
    fmt.Printf("Starting SNMP Trap listener on :162\n")
    err := listener.Listen("0.0.0.0:162")
    if err != nil {
        log.Fatalf("Error starting SNMP trap listener: %v", err)
    }
}

func handleTrap(packet *gosnmp.SnmpPacket, addr *net.UDPAddr) {
    fmt.Printf("Received SNMP trap from %s\n", addr.IP)
    for _, v := range packet.Variables {
        fmt.Printf("OID: %s, Value: %v\n", v.Name, v.Value)
    }
}