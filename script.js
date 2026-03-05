const firebaseConfig = {
apiKey: "AIzaSyAjRk2fg-3FYXsKoPlxJRiyh5K7QaphXms",
authDomain: "az-zaman-concepts-1.firebaseapp.com",
projectId: "az-zaman-concepts-1",
storageBucket: "az-zaman-concepts-1.firebasestorage.app",
messagingSenderId: "505802300721",
appId: "1:505802300721:web:2ede3206d6b8828b48e410"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const storage = firebase.storage();

const Pi = window.Pi;

Pi.init({version:"2.0",sandbox:false});

let user="Guest";

let items=[];



async function start(){

try{

const res=await Pi.authenticate(['username'],(p)=>console.log(p));

user=res.user.username;

document.getElementById("user-display").innerText="👤 "+user;

}catch(e){

console.log("Normal browser");

}

db.collection("listings")

.orderBy("createdAt","desc")

.onSnapshot(snap=>{

items=snap.docs.map(d=>({id:d.id,...d.data()}));

render(items);

renderDash();

});

}



function render(data){

const grid=document.getElementById("app-grid");

grid.innerHTML=data.map(i=>`

<div class="card">

<img src="${i.images[0]}" class="card-img">

<div class="card-content">

<small>${i.type}</small>

<h3>${i.title}</h3>

<div class="price">${i.price} Pi</div>

<button class="btn-buy" onclick="buy('${i.id}','${i.price}','${i.title}')">

Pay with Pi

</button>

</div>

</div>

`).join("");

}



function preview(e){

const r=new FileReader();

r.onload=()=>{

const o=document.getElementById("pPreview");

o.src=r.result;

o.style.display="block";

};

r.readAsDataURL(e.target.files[0]);

}



document.getElementById("postForm").addEventListener("submit",async(e)=>{

e.preventDefault();

const files=document.getElementById("pFile").files;

let urls=[];

for(let f of files){

const ref=storage.ref("items/"+Date.now()+"_"+f.name);

const snap=await ref.put(f);

const url=await snap.ref.getDownloadURL();

urls.push(url);

}

await db.collection("listings").add({

title:pTitle.value,

price:parseFloat(pPrice.value),

type:pType.value,

desc:pDesc.value,

images:urls,

seller:user,

createdAt:firebase.firestore.FieldValue.serverTimestamp()

});

alert("Item listed");

toggleModal("postModal");

e.target.reset();

});



async function buy(id,amt,name){

try{

await Pi.createPayment({

amount:parseFloat(amt),

memo:"Buy "+name,

metadata:{item:id}

},

{

onReadyForServerApproval:(id)=>{},

onReadyForServerCompletion:(id,tx)=>{

alert("Payment successful");

},

onCancel:(id)=>{},

onError:(err)=>{}

});

}catch(e){

alert("Open in Pi Browser");

}

}



function renderDash(){

const box=document.getElementById("user-listings");

const mine=items.filter(i=>i.seller===user);

box.innerHTML=mine.map(i=>`

<div>

<b>${i.title}</b> ${i.price} Pi

<button onclick="deleteItem('${i.id}','${i.images[0]}')">

Delete

</button>

</div>

`).join("");

}



async function deleteItem(id,img){

if(!confirm("Delete item?"))return;

await db.collection("listings").doc(id).delete();

await storage.refFromURL(img).delete();

}



function handleSearch(){

const q=searchInput.value.toLowerCase();

render(items.filter(i=>i.title.toLowerCase().includes(q)));

}



function filterItems(t,e){

document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));

e.target.classList.add("active");

render(t==="all"?items:items.filter(i=>i.type===t));

}



function toggleModal(id){

const m=document.getElementById(id);

m.style.display=m.style.display==="block"?"none":"block";

}

start();