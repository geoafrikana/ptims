let btn = document.getElementById('btn');
let ptin = document.getElementById('ptin').innerText;

console.log(ptin)

btn.addEventListener('click', ()=>{
    fetch(`/notify/${ptin}`)
.then(x => x.json())
.then(res => {
    if (res.status == 'success')
    {
        alert(`Mail sent to ${res.building.email}`)
    }
    else{
        alert('Mail could not be sent')
    }
});
})

// /notify/{{ptin}}