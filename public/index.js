const calcolaSubnet = () => {
  const rete = document.getElementById("original-network").value;
  const host = document.getElementById("host-number").value;

  axios
    .get("/valid-ip", { params: { ip: rete, host } })
    .then(() => console.log("ok"))
    .catch(() => console.log("no"));
};
