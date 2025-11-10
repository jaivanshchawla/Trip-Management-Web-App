import React, { useEffect, useState } from 'react'

const SupplierName = ({supplierId}) => {
    const [name, setName] = useState('')
    const fetchSupplierName = async()=>{
        const supplier = await fetch(`/api/suppliers/${supplierId}`)
        const supplierData = await supplier.json()
        setName(supplierData.supplier.name)
    }
    useEffect(()=>{
        fetchSupplierName()
    },[supplierId])
  return (
    <div>{name}</div>
  )
}

export default SupplierName
