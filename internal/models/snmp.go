package models

type SnmpData struct {
    OID   string `json:"oid"`
    Value string `json:"value"`
}
