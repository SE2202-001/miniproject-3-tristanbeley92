let allJobs = [];//Declare to be accessed from anywhere

//Job Class that holds all attributes for one job
class Job{
    constructor({
        "Job No": jobNo, 
        Title:title,
        "Job Page Link": jobPageLink, 
        Posted:posted,
        Type: type,
        Level:level,
        "Estimated Time": estimatedTime,
        Skill:skill,
        Detail:detail,
    }){
        //Intializing all job properties 
        this.jobNo = jobNo;
        this.title = title;
        this.jobPageLink = jobPageLink;
        this.posted =this.PostedTimeFinder(posted)
        this.type = type;
        this.level = level;
        this.estimatedTime = estimatedTime;
        this.skill = skill; 
        this.detail = detail;
    }

    PostedTimeFinder(posted){ //Converts the time posted from job into a actual data object 
        const [value, unit] = posted.split(" ");
        const now = new Date();
    
        switch(unit){
            case "minutes":
            case "minute": //used this just in case there was a "minute" ago 
                return new Date(now.getTime() - value * 60000) //In case of minutes, subtract minutes from current time

            case "hours": //Case for both 1 and other hours.
            case "hour":
                return new Date(now.getTime() - value * 3600000)//In case of hours, subtract from current time
            default:
                return now; 
        }
    }

    getFormattedPostedTime(){//Formats and returns a string that represents how long ago the job was posted
        const hoursAgo = Math.floor((new Date() - this.posted)/60000);
        if (hoursAgo < 60){
            return `${hoursAgo} minutes ago`;//If less then one hour, displays minutes
        }

        const diffhours = Math.floor(hoursAgo / 60);
        return `${diffhours} hour${diffhours === 1? "" : "s"} ago`; //Convertor to hours 
     }

    getDetails(){//Returns attributes of teh given job 
        return `
            Job No: ${this.jobNo}
            Title: ${this.title}
            Type: ${this.type}
            Level: ${this.level}
            Estimated Time: ${this.estimatedTime}
            Skill ${this.skill}
            Posted: ${this.getFormattedPostedTime()}
            Detail: ${this.detail}
            Link: ${this.jobPageLink}
        `;
    }
}

//File Upload
document.getElementById("file-upload").addEventListener("change", (event) => {
    const file  = event.target.files[0]; // Takes uploaded file
    const reader= new FileReader();

    reader.onload = function (upfile) { //When File is succefully read does the follwoing 
        try{
            const data = JSON.parse(upfile.target.result); 
            allJobs = data.map(jobdata => new Job(jobdata)); //Convert raw data to job objects 
            populateFilterOptions(allJobs); //Populate the dropdown filters with given info
            renderJobs(allJobs); //Display all jobs
        } catch(error){ //If does not read properly (Not JSON) dispalyes error message
            alert("Error parsing JSON file, Please ensure that it is correctly formatted! ")
        }
    };

    reader.readAsText(file); //Read the file as text 
});

//Populating Filters 
function populateFilterOptions(jobs){
    //Unique levels, types and skills
    const levels = new Set(jobs.map(job => job.level || "No Data"));
    const types = new Set(jobs.map(job => job.type || "No Data"));
    const skills = new Set(jobs.map(job => job.skill || "No Data"));

    //Update dropdown
    updateDropdown("level-filter", levels);
    updateDropdown("type-filter", types);
    updateDropdown("skill-filter", skills);
}

//Updates dropdown with given options
function updateDropdown(id,options){
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '<option value = "">All</option>'; // Adding defualt All option to reset eventually. 
    options.forEach(option => {
        const opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt); // Add each unique option to the dropdown
    });
}

//Job listings

function renderJobs(jobs){
    const jobList = document.getElementById("job-listings");
    jobList.innerHTML = ""; //Clear existing jobs

    if(jobs.length === 0){
        jobList.textContent = "No jobs available. "; //Display if no jobs 
        return;
    }

//Populate job popup with attributes  
jobs.forEach(job => {
    const jobElement = document.createElement("div");
    jobElement.classList.add("job-item");

    jobElement.innerHTML = `

            <div class="job-title">${job.title}</div>
            <div class="job-metadata">
                <strong>Type:</strong> ${job.type} (${job.level})<br>
                <strong>Estimated Time:</strong> ${job.estimatedTime}<br>
                <strong>Posted:</strong> ${job.getFormattedPostedTime()}
            </div>
            <div class="job-link">
                <a href="${job.jobPageLink}" target="_blank">View Job</a>
            </div>
      `; 
    jobElement.addEventListener("click", () => openPopup(job)); // Open popup
    jobList.appendChild(jobElement); // Add job card to list
    });
}

//Opens the popup 
function openPopup(job) {
    const popup = document.getElementById("job-details-popup");
    const popupDetails = document.getElementById("popup-details");

    // Populates the popup with job details
    popupDetails.innerHTML = `
        <h2>${job.title}</h2>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Level:</strong> ${job.level}</p>
        <p><strong>Skill:</strong> ${job.skill}</p>
        <p><strong>Estimated Time:</strong> ${job.estimatedTime}</p>
        <p><strong>Posted:</strong> ${job.getFormattedPostedTime()}</p>
        <p><strong>Description:</strong> ${job.detail}</p>
        <p><a href="${job.jobPageLink}" target="_blank">View Full Job</a></p>
    `;

    popup.classList.remove("hidden"); //Makes popup visible
}

function closePopup() {
    const popup = document.getElementById("job-details-popup");
    popup.classList.add("hidden");//Hide popup 
}

//Closes popup when 'x' is clicked 
document.getElementById("popup-close").addEventListener("click", closePopup);

//Close popup when clicking outside box
window.addEventListener("click", (event) => {
    const popup = document.getElementById("job-details-popup");
    if (event.target === popup) {
        closePopup();
    }
});

//Filter and sort
document.getElementById("filter-sort-btn").addEventListener("click", () => {
    //retrieves filter values
const filters = {
    level: document.getElementById("level-filter").value,
    type: document.getElementById("type-filter").value,
    skill: document.getElementById("skill-filter").value,
};

//gets selected option for sort
const sortOption = document.getElementById("sort-options").value;

//gets selected option for filter 
let filteredJobs = allJobs.filter(job => 
    (!filters.level||job.level == filters.level)&&
    (!filters.type||job.type == filters.type)&&
    (!filters.skill||job.skill == filters.skill)
);

//Filtered jobs 
filteredJobs = filteredJobs.sort((a,b) => {

    if (sortOption === "title-asc") return a.title.localeCompare(b.title); // Compares a to b => Sort A-Z
    if (sortOption === "title-desc") return b.title.localeCompare(a.title); // Compares b to a => Sort Z-A
    if (sortOption === "time-new") return b.posted - a.posted; // Sort by newest
    if (sortOption === "time-old") return a.posted - b.posted; // Sort by Oldest 
});

    renderJobs(filteredJobs); // Re-displays jobs with applied filters and sort options 
});