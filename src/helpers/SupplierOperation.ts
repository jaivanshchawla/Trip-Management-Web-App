export const supplierTripCount = async (supplierId: string) => {
    try {
        const res = await fetch(`/api/suppliers/${supplierId}/tripCount`)
        if (!res.ok) {
            alert('Failed to Count Trips')
            return 0
        }
        const data = await res.json()
        return data.tripCount
    } catch (error) {
        alert(error)
        return 0
    }
}