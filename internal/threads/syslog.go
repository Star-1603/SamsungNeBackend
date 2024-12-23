package threads

import (
	"fmt"
	"log"
	"net"
	"strings"
)

func StartSyslogListener() {
	addr := net.UDPAddr{
		Port: 514,
		IP:   net.ParseIP("0.0.0.0"),
	}

	conn, err := net.ListenUDP("udp", &addr)
	if err != nil {
		log.Fatalf("Error setting up Syslog server: %v", err)
	}
	defer conn.Close()

	fmt.Printf("Syslog server running on :514")

	buf := make([]byte, 4096)
	for {
		n, remoteAddr, err := conn.ReadFromUDP(buf)
		if err != nil {
			fmt.Printf("Error reading UDP packet: %v", err)
			continue
		}

		message := strings.TrimSpace(string(buf[:n]))
		fmt.Printf("Received message from %s: %s\n", remoteAddr, message)
	}
}