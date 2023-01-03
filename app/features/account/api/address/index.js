export const updateAddress = async (editingAddress, data) => {
  fetch("/api/stripe/editcustomer", { method: 'POST', body: JSON.stringify({ id: editingAddress, data }) })
    .then(response => response.json())
    .then(response => {
      if(response?.success){
        console.log("Success")
      }
    })
}