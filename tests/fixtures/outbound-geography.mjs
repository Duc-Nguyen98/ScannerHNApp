export function fixtureGeography(){
 const provinces=[{id:'79',name:'Thành phố Hồ Chí Minh'},{id:'1',name:'Thành phố Hà Nội'}];
 const districts={'79':[{id:'760',name:'Quận 1',provinceId:'79'},{id:'761',name:'Quận 12',provinceId:'79'}],'1':[{id:'1',name:'Quận Ba Đình',provinceId:'1'}]};
 return {cachedProvinces:()=>structuredClone(provinces),cachedDistricts:id=>structuredClone(districts[id]||[]),provinces:async()=>structuredClone(provinces),districts:async id=>structuredClone(districts[id]||[])};
}
export function chooseFixtureAddress(flow){flow.select('province','79');flow.select('district','760');flow.field('address','123 Lê Lợi');}
