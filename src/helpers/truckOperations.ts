export const fetchTruckName = async (truck_id : string)=>{
    const res = await fetch(`/api/trucks/${truck_id}`,{
        method : 'GET',
        headers :{
            'Content-Type': 'application/json',
        }
    })

    if(!res.ok){
        alert('Failed to Fetch Truck Number')
        throw new Error('Failed to fetch truck name')
    }
    const data = await res.json()
    const truckNo = data.truck.truckNo
    return truckNo

}

