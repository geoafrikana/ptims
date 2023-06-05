// import data from './data.json';

const createBuildings = (raw_buildings)=>{
    // .map(i=>i.reverse())

    const arr = []
    let    myGeoJson = {}
    myGeoJson.type = 'FeatureCollection',

raw_buildings.map((raw_building)=>{
    let b = {}
    b.type = 'Feature'
    b.geometry = {}
    b.geometry.type = 'Polygon'
    b.geometry.coordinates = [raw_building.poly.coordinates[0][0]]
    b.properties = {}
    b.properties.owner_photo = raw_building.owner_photo ? raw_building.owner_photo : 'https://picsum.photos/150'
    b.properties.building_photo1 = raw_building.building_photo1 ? raw_building.building_photo1 : 'https://picsum.photos/150'
    b.properties.owner = raw_building.owner
    b.properties.ptin = raw_building.ptin
    b.properties.email = raw_building.email
    b.properties.category = raw_building.category 
    b.properties.address = `${raw_building.house_no}, ${raw_building.street}`
    b.properties.no_floor = raw_building.no_floor
    b.properties.no_rooms = raw_building.no_rooms
    b.properties.water_source = raw_building.water_source
    b.properties.year_no = raw_building.year_no
    b.properties.tax_due = raw_building.tax_due
    b.properties.tax_paid = raw_building.tax_paid
     
    arr.push(b)
})

myGeoJson.features = arr
return myGeoJson
}

const bindFeaturePopup = function(feature, marker) {
           
        marker.bindPopup(`<div">
        <div style="display:flex;gap:5px 10px">
        <img style="width:150px" src=${feature.properties.owner_photo} />
        <img style="width:150px" src=${feature.properties.building_photo1} />
        </div>
        <div id='grid-parent'>
        <p><strong>PTIN: </strong>${feature.properties.ptin}</p> 
        <p><strong>Owner: </strong><span class="capitalize">${feature.properties.owner}</span></p>
        <p><strong>Email: </strong>${feature.properties.email}</p>
        <p><strong>Category: </strong><span class="capitalize">${feature.properties.category? feature.properties.category : 'null'}</span></p>
        <p><strong>Address: </strong>${feature.properties.address}</p>
        <p><strong>Floors: </strong>${feature.properties.no_floor}</p>
        <p><strong>Rooms: </strong> ${feature.properties.no_rooms}</p>
        <p><strong>Water Source: </strong>${feature.properties.water_source}</p>
        <p><strong>Year of Construction: </strong> ${feature.properties.year_no}</p>
        <p><strong>Tax Due: </strong>${feature.properties.tax_due}</p>
        <p><strong>Tax Paid: </strong> ${feature.properties.tax_paid}</p>
        <a href="/tax-assessment/${feature.properties.ptin}"><button> Assess Tax</button></a>
        </div>

        </div>
        
        `);
    }

const getBuildingsHavingAttributes = (building)=>{
        if (building.properties.owner !== null) return true
      }

const getBuildingsNotHavingAttributes = (building)=>{
    if (building.properties.owner == null) return true
}

const getTaxDefaulters = (building)=>{
    if (building.properties.tax_due > building.properties.tax_paid) return true
}


const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

const googleSatellite = L.tileLayer(
    'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
    {maxZoom:19, attribution:'© Google Satellite'}   
     )

const map = L.map('map', {
        center: [ 6.445823954852021, 5.602769851684571],
        zoom: 16,
        layers: [osm]
    });



const fetchBuildings = ()=>{
    // const url = new URL('http://44.212.9.24/api/buildings')
    
   fetch('./static/base/js/data.json')
   .then(response=>{
    return response.json()
   })
   .then(
    data => 
    {
        data = data['data']
        data = createBuildings(data);
        // createBuildings(data)
        const buildingsHavingAttributes = new L.GeoJSON(data, {
            'filter': getBuildingsHavingAttributes, onEachFeature: bindFeaturePopup })
        const buildingsHavingNoAttributes = new L.GeoJSON(data,
             {'filter': getBuildingsNotHavingAttributes,
              onEachFeature: bindFeaturePopup ,
            'style':{
                fillColor: "#f72105",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.4
            }})
        const taxDefaulters = new L.GeoJSON(data, 
            {'filter': getTaxDefaulters,
            style:{
                fillColor: "#f72105",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.4
            },
            onEachFeature: bindFeaturePopup })
     
     
         var featuresLayer = new L.GeoJSON(data, {
             style: {
               fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.4

             },
            //  function(feature) {
             //     return {color: feature.properties.color };
             // },
             onEachFeature: bindFeaturePopup }).addTo(map);
     
     
         const baseMaps = {
             'Open Street Map': osm,
             'Google Satellite': googleSatellite
         }
     
         const overlayMaps = {
             'All Buildings': featuresLayer,
             'Valid Buildings': buildingsHavingAttributes,
             'Invalid Buildings': buildingsHavingNoAttributes,
             'Tax Defaulters': taxDefaulters
          }
         
         L.control.layers(baseMaps, overlayMaps).addTo(map);
     
         var searchControl1 = new L.Control.Search({
             layer: featuresLayer,
             propertyName: 'ptin',
             textPlaceholder: 'PTIN...',
             textErr: 'PTIN not found',
             marker: false,
             moveToLocation: function(latlng, title, map) {
                 //map.fitBounds( latlng.layer.getBounds() );
                 var zoom = map.getBoundsZoom(latlng.layer.getBounds());
                   map.setView(latlng, zoom); // access the zoom
             }
         });
     
         var searchControl2 = new L.Control.Search({
             layer: featuresLayer,
             textPlaceholder: 'Name...',
             textErr: 'Name not found',
             propertyName: 'owner',
             marker: false,
             moveToLocation: function(latlng, title, map) {
                 //map.fitBounds( latlng.layer.getBounds() );
                 var zoom = map.getBoundsZoom(latlng.layer.getBounds());
                   map.setView(latlng, zoom); // access the zoom
             }
         });
     
     
        let cb = function(e) {
         e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
         if(e.layer._popup)
             e.layer.openPopup();
     
     }
     
     let cb2 = function(e) {
     
         featuresLayer.eachLayer(function(layer) {	//restore feature color
             featuresLayer.resetStyle(layer);
         });	
     }
     
     
         searchControl1.on('search:locationfound', cb).on('search:collapsed', cb2);
         searchControl2.on('search:locationfound', cb).on('search:collapsed', cb2);
         
         map.addControl( searchControl1);
         map.addControl( searchControl2 );
         map.fitBounds(featuresLayer.getBounds())
     
        
         

    }  )
   
};

fetchBuildings();