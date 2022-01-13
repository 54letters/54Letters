document.addEventListener("DOMContentLoaded", () => {

// Grab form element from page
const form = document.querySelector("#postcode")
const message = document.querySelector("#message")
const error = document.querySelector("#error")
const loading = document.querySelector("#loading")

function ShowMPInfo() {
  let result = document.getElementById("mpInfoBox");
  document.getElementById('graphicButton').style="display:block";
  result.style.display = "block";
  document.getElementById('mpInfoBox').scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
  loading.style.display = "none";
  socials.style.display = "none";
}

function generateGraphic() {

  html2canvas(document.querySelector("#mpInfoBox"), {
    useCORS:true,
    proxy: 'https://mpreportcard.github.io/54Letters/',
    windowWidth: mpInfoBox.width,
    width: mpInfoBox.width,
    windowHeight: 875,
    height: 875,

  }).then(canvas => {
      canvas.id = "graphic";
      document.getElementById('graphicOutput').appendChild(canvas);
      document.getElementById('graphic').style="display:none";
      document.getElementById('graphicButton').style="display:none";
      imgPreview = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      download_image();
  });

}

function download_image() {
  let download = document.getElementById("graphic");
  image = download.toDataURL("image/png").replace("image/png", "image/octet-stream");
  let link = document.createElement('a');
  link.download = "graphic.png";
  link.href = image;
  link.click();
}

let constituency
let constituencyString
let mpFirstName
let mpLastName
let mpFirstNameRaw
let mpLastNameRaw
let vote
let voteString
let accused
let party
let partyString
let note
let mpID

form.addEventListener("submit", e => {
  // Stop page refreshing
  e.preventDefault()
  // Make form data accessible as JS variable
  let formData = new FormData(form)
  let postcode = formData.get("postcode")

  function printMessageToScreen(constituencyString){
  fetch(`https://mpreportcard.github.io/54Letters/js/constituencies.json`)
      .then(res => res.json())
      .then(data => {
      console.log(data);
      if(constituencyString == undefined) {
        error.style.display = "block";
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
      } else if (constituencyString == "Southend West" || constituencyString == "Birmingham Erdington") {
        error.style.display = "block";
        error.innerHTML = `Your constituency, ${constituencyString}, does not currently have an MP until an upcoming by-election.`;
      } else {
        loading.style.display = "block";
        error.style.display = "none"
        mpFirstNameRaw = data[constituencyString].Firstname
        mpFirstName = mpFirstNameRaw.toString()
        mpLastNameRaw = data[constituencyString].Lastname
        mpLastName = mpLastNameRaw.toString()
        mpFullName = mpFirstName + " " + mpLastName
        accused = data[constituencyString].Accused
        noteRaw = data[constituencyString].Note
        note = noteRaw.toString();

      fetch(`https://members-api.parliament.uk/api/Members/Search?Name=${mpFirstName}%20${mpLastName}&skip=0&take=20`)
          .then(res => res.json())
          .then(parlData => {
            //console.log(parlData)
            party = parlData.items[0].value.latestParty.name;
            partyString = party;
            mpID = parlData.items[0].value.id;
            console.log(mpID);
            switch (party) {
                case "Conservative":
                  break;
                default:
            }

            document.getElementById("mpNameBullet").innerHTML = `${mpFullName}`;
            document.getElementById("constituencyBullet").innerHTML = `${constituencyString}`;
            document.getElementById("mpNameBullet2").innerHTML = `${mpFullName}`;
            document.getElementById("constituencyBullet2").innerHTML = `${constituencyString}`;
            document.getElementById("constituencyBullet3").innerHTML = `${constituencyString}`;

            let graphicButton = document.getElementById('graphicButton');
            graphicButton.addEventListener("click", generateGraphic);

            if (party == "Conservative") {
              ShowMPInfo();
              document.getElementById("explanation").style.display = "block";
            } else {
              error.innerHTML = `Looks like you do not have a Conservative MP in ${constituencyString}. Consider sharing this page with your friends who do!`;
              error.style.display = "block";
              loading.style.display = "none";
              document.getElementById("explanation").style.display = "none";
              twtLink.setAttribute("href", `https://twitter.com/intent/tweet?text=Your%20Tory%20MP%20has%20the%20power%20to%20remove%20Boris%20Johnson%20-%20here's%20the%20letter%20they%20need%20to%20sign%20%F0%9F%91%87&url=https%3A%2F%2F54letters.netlify.app%3Futm_source%3Dtwitter%26utm_medium%3Dsocial%26utm_campaign%3D_tw`)
              fbLink.setAttribute("href", `https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2F54letters.netlify.app?utm_source=facebook&utm_medium=social&utm_campaign=_fb`)
              waLink.setAttribute("href", `https://api.whatsapp.com/send?text=Your%20Tory%20MP%20has%20the%20power%20to%20remove%20Boris%20Johnson%20-%20here's%20the%20letter%20they%20need%20to%20sign%20%F0%9F%91%87https%3A%2F%2F54letters.netlify.app%3Futm_source%3Dwhatsapp%26utm_medium%3Dsocial%26utm_campaign%3D_wa`)
              socials.style = "display: flex";
            }
          })

  }
                      }
            )
  }

function getConstituencyName(postcode) {
  fetch(`https://api.postcodes.io/postcodes/${postcode}`)
    .then(res => res.json())
    .then(data => {
      if(data.status != 200) {
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
        error.style.display = "block";
      } else {
      let constituency = data.result.parliamentary_constituency
      let constituencyString = constituency.toString()
      printMessageToScreen(constituencyString)
      }
    }
    )
}

getConstituencyName(postcode);

})

})
