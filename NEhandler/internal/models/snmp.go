package models

type SnmpData struct {
    OID   string `json:"oid"`
    Value string `json:"value"`
}

type NetworkInfo struct {
    InterfaceName string `json:"interface_name"` // Name of the network interface (e.g., eth0)
    IP            string `json:"ip"`             // IP address of the interface
    Subnet        string `json:"subnet"`         // Subnet mask
    HardwareAddr  string `json:"hardware_addr"`  // MAC address of the interface
    Status        string `json:"status"`         // Status of the interface (up or down)
    MTU           int    `json:"mtu"`            // Maximum transmission unit
    Broadcast     string `json:"broadcast"`      // Broadcast address
    NetworkType   string `json:"network_type"`   // Type of the network (e.g., IPv4 or IPv6)
}