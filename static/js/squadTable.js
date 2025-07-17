function loadModalSubdomain(id, subdom, squadgroup, tower) {
  document.getElementById('modalID').value = id;
  document.getElementById('modalSubdomain').value = subdom;
  document.getElementById('modalSquadGroup').value = squadgroup;
  document.getElementById('modalTower').value = tower;
}

function DeleteRowFunction(o) {
 var p=o.parentNode.parentNode.parentNode;
     p.parentNode.removeChild(p);
}

function loadModalSquadAccess(id, email, access, value, mode) {
  $('#modalHead').text(mode);
  document.getElementById('mode').value = mode;
  document.getElementById('id').value = id;
  document.getElementById('email').value = email;
  document.getElementById('access').value = access;
  document.getElementById('value').value = value;

}
