document.getElementById("country-code").addEventListener("change", (event) => {
    chrome.storage.sync.set({ "countryCode": document.getElementById("country-code").value });
});

chrome.storage.sync.get(["countryCode"]).then((result) => {
    document.getElementById("country-code").value = result.countryCode ? parseInt(result.countryCode) : 54;
});

chrome.storage.sync.get(["phonesList"]).then((result) => {
    updatePhoneHistory(result.phonesList);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.countryCode) {
        document.getElementById("country-code").value = changes.countryCode.newValue ? parseInt(changes.countryCode.newValue) : 54;
        document.getElementById("phone-send-number").placeholder = "(+" + document.getElementById("country-code").value + ") 123-45-678";
    }
    if (changes.phonesList) updatePhoneHistory(changes.phonesList.newValue);
});

function updatePhoneHistory(phonesList) {
    if (phonesList && phonesList.length > 0) {
        var phonesListHtml = "";
        phonesList.forEach(phone => {
            phonesListHtml = `
            <div class="phone">
                <i class="fa fa-phone"></i>+<span>` + phone + `</span>
                <button id="phone-remove-` + phone + `" data-phone="` + phone + `"><i class="fa fa-fw fa-remove" title="Remove phone"></i></button>
                <button id="phone-send-` + phone + `" data-phone="` + phone + `"><i class="fa fa-fw fa-send" title="Send message"></i></button>
            </div>` + phonesListHtml;
        });
        document.getElementById("phones-history").classList.remove("empty-phones");
        document.getElementById("phones-history").innerHTML = phonesListHtml;
        phonesList.forEach(phone => {
            document.getElementById("phone-send-" + phone).addEventListener("click", () => {
                sendMessage(document.getElementById("phone-send-" + phone).getAttribute("data-phone"));
            });
            document.getElementById("phone-remove-" + phone).addEventListener("click", () => {
                removePhone(document.getElementById("phone-remove-" + phone).getAttribute("data-phone"));
            })
        });
    } else {
        document.getElementById("phones-history").classList.add("empty-phones");
        document.getElementById("phones-history").innerHTML = "<p style='text-align: center'>There's no phone messages</p>";
    }
}

document.getElementById("clear-history").addEventListener("click", () => {
    if (confirm("Sure you want to clear phones history?")) {
        chrome.storage.sync.set({ "phonesList": [] }).then(() => {
            updatePhoneHistory([]);
        });
    }
});

function removePhone(phoneNumber) {
    chrome.storage.sync.get(["phonesList"]).then((result) => {
        var phonesList = result.phonesList ? result.phonesList : [];
        if (phonesList.indexOf(phoneNumber) >= 0) {
            phonesList.splice(phonesList.indexOf(phoneNumber), 1);
            chrome.storage.sync.set({ "phonesList": phonesList }).then(() => {
                updatePhoneHistory(phonesList);
            });
        }
    });
}

function sendMessage(phoneNumber) {
    chrome.tabs.create({
        url: "https://api.whatsapp.com/send/?phone=" + phoneNumber,
        selected: true
    });

    chrome.storage.sync.get(["phonesList"]).then((result) => {
        var phonesList = result.phonesList ? result.phonesList : [];
        if (!phonesList.includes(phoneNumber)) {
            phonesList.push(phoneNumber);
            chrome.storage.sync.set({ "phonesList": phonesList });
        }
    });
}

document.getElementById("phone-send").addEventListener("click", () => {
    chrome.storage.sync.get(["countryCode"]).then((result) => {
        var phoneNumber = (result.countryCode ? parseInt(result.countryCode) : 54) + document.getElementById("phone-send-number").value.replace(/\D/g, '');
        sendMessage(phoneNumber);
    });
});