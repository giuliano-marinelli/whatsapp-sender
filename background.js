chrome.contextMenus.create({
    id: "whatsappmessage",
    title: "Send WhatsApp Message",
    contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    chrome.storage.sync.get(["countryCode"]).then((result) => {
        var phoneNumber = (result.countryCode ? parseInt(result.countryCode) : 54) + info.selectionText.replace(/\D/g, '');

        if (info.menuItemId === "whatsappmessage") {
            chrome.tabs.create({
                url: "https://api.whatsapp.com/send/?phone=" + phoneNumber,
                selected: true
            });
        }

        chrome.storage.sync.get(["phonesList"]).then((result) => {
            var phonesList = result.phonesList ? result.phonesList : [];
            if (!phonesList.includes(phoneNumber)) {
                phonesList.push(phoneNumber);
                chrome.storage.sync.set({ "phonesList": phonesList });
            }
        });

    });
});