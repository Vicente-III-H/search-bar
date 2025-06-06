const textArea = document.querySelector("#notes");
const saveStatus = document.querySelector("#save-status");

const Status = {
    NotSaved: 0,
    Saved: 1,
    Saving: 2,
    SavingNotEnabled: 3,
    Nil: 4
};
const INPUT_INTERVAL = 1500;

function changeSaveStatus(newStatus) {
    switch (newStatus) {
        case Status.NotSaved:
            saveStatus.textContent = "Not Saved";
            saveStatus.style.fontStyle = "normal";
            break;
        case Status.Saved:
            saveStatus.textContent = "Saved";
            saveStatus.style.fontStyle = "italic";
            break;
        case Status.Saving:
            saveStatus.textContent = "Saving...";
            saveStatus.style.fontStyle = "normal";
            break;
        case Status.SavingNotEnabled:
            saveStatus.textContent = "Saving is not enabled";
            saveStatus.style.fontStyle = "normal";
            break;
        case Status.Nil:
            saveStatus.textContent = "";
            saveStatus.style.fontStyle = "normal";
            break;
    }
}

let inactivityTimer;
let changesExist = false;
let savingFromOutside = false;
let savingEnabled = false;
let previousTimestamp = 0;

const saveNotes = async (data) => {
    try {
        if (savingEnabled) {
            changeSaveStatus(Status.Saving);
            
            if (previousTimestamp < await getRecentSaveTimestamp("note1")) {
                savingEnabled = false;
                throw new Error("Loaded save data is not most recent");
            }
            await chrome.storage.sync.set({ "note1": data });
            previousTimestamp = (new Date()).getTime();
            await chrome.storage.sync.set({ "timestamp-note1": previousTimestamp });

            changeSaveStatus(Status.Saved);
        } else {
            changeSaveStatus(Status.SavingNotEnabled);
        }
    } catch(error) {
        changeSaveStatus(Status.NotSaved);
        throw new Error(error);
    }
};

const getNotes = async () => {
    try {
        const data = await chrome.storage.sync.get(["note1"]);
        if (data.note1 === undefined) {
            await chrome.storage.sync.set({ "note1": "" });
            textArea.value = "";
        } else {
            textArea.value = data.note1;
        }
        previousTimestamp = await getRecentSaveTimestamp("note1");
        changeSaveStatus(Status.Nil);
    } catch(error) {
        throw new Error(error);
    }
}

const getRecentSaveTimestamp = async (note) => {
    try {
        const data = await chrome.storage.sync.get([`timestamp-${note}`]);
        let timestamp = data[`timestamp-${note}`];
        if (timestamp === undefined) {
            const name = `timestamp-${note}`;
            timestamp = (new Date()).getTime();
            const saveData = {};
            saveData[name] = timestamp;
            await chrome.storage.sync.set(saveData);
        }
        return timestamp;
    } catch (error) {
        throw new Error(error);
    }
}

textArea.addEventListener("input", () => {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }

    inactivityTimer = setTimeout(async () => {
        if (!savingFromOutside && changesExist) {
            try {
                await saveNotes(textArea.value);
                changesExist = false;
            } catch(error) {
                console.log(error);
            }
        }
    }, INPUT_INTERVAL);

    if (!changesExist) {
        changesExist = true;
        changeSaveStatus(Status.NotSaved);
    }
})

textArea.addEventListener("change", async () => {
    if (changesExist) {
        try {
            savingFromOutside = true;
            await saveNotes(textArea.value);
            changesExist = false;
        } catch(error) {
            console.log(error);
        } finally {
            savingFromOutside = false;
        }
    }
})

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await getNotes();
        savingEnabled = true;
        textArea.placeholder = "Type notes here...";
        textArea.style.setProperty("--placeholderStyle", "normal");
    } catch(error) {
        console.log(error);
        textArea.placeholder = "Failed to get save data";
    }
});