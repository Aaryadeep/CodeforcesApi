// Fetch user rating history
function fetchUserRatingHistory(username) {
   const apiurl = `https://codeforces.com/api/user.rating?handle=${username}`;
   return fetch(apiurl)
      .then(response => response.json())
      .then(data => {
         if (data.status === "OK") {
            return data.result;
         } else {
            return Promise.reject(`Data error in fetching Rating: ${data.comment}`);
         }
      });
}

// Fetch user submissions
function fetchUserSubmissions(username) {
   const apiurl = `https://codeforces.com/api/user.status?handle=${username}`;
   return fetch(apiurl)
      .then(response => response.json())
      .then(data => {
         if (data.status === "OK") {
            return data.result;
         } else {
            return Promise.reject(`Data error in fetching Submissions: ${data.comment}`);
         }
      });
}



let username = "";
const searchButton = document.getElementById("searchButton");

function fetchUser(username) {
   const apiurl = `https://codeforces.com/api/user.info?handles=${username}`;
   return fetch(apiurl)
      .then((response) => {
         if (!response.ok) {
            return Promise.reject(`Https error status: ${response.status}`);
         }
         return response.json();
      })
      .then((data) => {
         if (data.status === "OK") {
            return data.result[0];
         } else {
            return Promise.reject(`Data error: ${data.comment}`);
         }
      })
      .catch((e) => {
         console.log("Can't fetch error:", e);
      });
}

let userInfo = null;

function DisplayUserInfo(userInfo) {
   const userInfoDiv = document.getElementById("userInfoDiv");

   // Clear previous data to avoid duplication
   userInfoDiv.innerHTML = "";

   const nameText = document.createElement("h2");
   nameText.textContent = `${userInfo.firstName} ${userInfo.lastName || ""}`; // Check for lastName

   const userRating = document.createElement("p");
   userRating.textContent = `Rating: ${userInfo.rating}`;

   const userImg = document.createElement("img");
   userImg.src = userInfo.avatar;
   userImg.alt = `${userInfo.firstName}'s avatar`;

   // Append new data
   userInfoDiv.appendChild(nameText);
   userInfoDiv.appendChild(userImg);
   userInfoDiv.appendChild(userRating);

   // Fetch rating history and submissions
   fetchUserRatingHistory(userInfo.handle).then(ratingHistory => {
      displayRatingGraph(ratingHistory);
   });

   fetchUserSubmissions(userInfo.handle).then(submissions => {
      const acceptedByRating = groupAcceptedByRating(submissions);
      displaySubmissionGraph(acceptedByRating);
   });
}

// Function to group accepted submissions by problem rating
function groupAcceptedByRating(submissions) {
   const accepted = submissions.filter(sub => sub.verdict === "OK" && sub.problem.rating);
   const ratingCounts = {};
   accepted.forEach(sub => {
      const rating = sub.problem.rating;
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
   });
   return ratingCounts;
}

let ratingChartInstance = null;
let submissionChartInstance = null;

// Function to display the user's rating graph
function displayRatingGraph(ratingHistory) {
   document.getElementById('ratingChart').innerHTML = "";
   const ctx = document.getElementById('ratingChart').getContext('2d');
   if (ratingChartInstance) {
      ratingChartInstance.destroy();
   }
   const labels = ratingHistory.map(entry => new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString());
   const ratings = ratingHistory.map(entry => entry.newRating);

   ratingChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
         labels: labels,
         datasets: [{
            label: 'Rating',
            color: 'white',
            data: ratings,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
         }]
      },
      options: {
         plugins: {
            legend: {
               labels: {
                  color: 'white'
               }
            }
         },
         scales: {
            x: { title: { display: true, text: 'Date', color: 'white' }, ticks: { color: 'white' } },
            y: { title: { display: true, text: 'Rating', color: 'white' }, ticks: { color: 'white' } }
         }
      }
   });
}

// Function to display the user's accepted submissions count by rating
function displaySubmissionGraph(acceptedByRating) {
   document.getElementById('submissionChart').innerHTML = "";
   const ctx = document.getElementById('submissionChart').getContext('2d');
   if (submissionChartInstance) {
      submissionChartInstance.destroy();
   }
   const ratings = Object.keys(acceptedByRating);
   const counts = Object.values(acceptedByRating);

   submissionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
         labels: ratings,
         datasets: [{
            label: 'Accepted Submissions by Rating',
            color: 'white',
            data: counts,
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
         }]
      },
      options: {
         plugins: {
            legend: {
               labels: {
                  color: 'white'
               }
            }
         },
         scales: {
            x: { title: { display: true, text: 'Problem Rating', color: 'white' }, ticks: { color: 'white' } },
            y: { title: { display: true, text: 'Count of Accepted Submissions', color: 'white' }, ticks: { color: 'white' } }
         }
      }
   });
}

searchButton.addEventListener("click", () => {
   let username = document.getElementById("userhandle").value;

   // Check if username is not empty
   if (username.trim() === "") {
      console.log("Please enter a valid Codeforces username.");
      return;
   }

   fetchUser(username)
      .then((data) => {
         userInfo = data;
         DisplayUserInfo(userInfo);
      })
      .catch((error) => {
         console.log("Data lost:", error);
      });
});
