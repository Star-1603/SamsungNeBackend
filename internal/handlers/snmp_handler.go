package handlers

import (
    "net/http"
)

func SnmpHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("SNMP Handler Response"))
}
