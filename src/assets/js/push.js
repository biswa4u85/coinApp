var appServerKey = "BPry5K4T2_2U365eMDTd4I00OuUNsFfBUsWNrZPGCB-3hKdqVgWCTmpVO8kHKtnBoN6F1aAaKIb3htlLASzZH3s";

// const pushWrapper = document.querySelector('.push-wrapper');
// const pushButton = document.querySelector('.push-button');

var hasSubscription = false;
var serviceWorkerRegistration = null;
var subscriptionData = false;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeUser(userId) {
  serviceWorkerRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(appServerKey)
  }).then(function (subscription) {
    let bodyObject = {
      userId: userId,
      subscription: subscription
    }
    fetch('https://appitalk.in:8444/push/subscribe/', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyObject)
    }).then(function (response) {
      return response;
    }).then(function (text) {
      hasSubscription = true;
      //   updatePushButton();
    }).catch(function (error) {
      hasSubscription = false;
      console.error('error fetching subscribe', error);
    });
  })
    .catch(function (err) { });
}

function unsubscribeUser() {
  serviceWorkerRegistration.pushManager.getSubscription()
    .then(function (subscription) {
      if (subscription) {
        subscriptionData = {
          endpoint: subscription.endpoint
        };

        fetch('https://appitalk.in:8444/push/unsubscribe', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscriptionData)
        })
          .then(function (response) {
            return response;
          })
          .then(function (text) {
            hasSubscription = false;

            // updatePushButton();
          })
          .catch(function (error) {
            hasSubscription = true;
            console.error('error fetching subscribe', error);
          });

        hasSubscription = false;

        // updatePushButton();
        return subscription.unsubscribe();
      }
    });
}

function initPush() {

  //   pushButton.addEventListener('click', function () {
  //     if (hasSubscription) {
  //       unsubscribeUser();
  //     } else {
  //       subscribeUser();
  //     }
  //   });

  // Set the initial subscription value
  serviceWorkerRegistration.pushManager.getSubscription()
    .then(function (subscription) {
      hasSubscription = !(subscription === null);

      //   updatePushButton();
    });
}

navigator.serviceWorker.register('./assets/js/sw.js')
  .then(function (sw) {
    serviceWorkerRegistration = sw;
    initPush();
  })
  .catch(function (error) {
    console.error('Service Worker Error', error);
  });
