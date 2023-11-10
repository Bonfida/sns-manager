# How to

This Readme describes how to setup local env to be able to make a development
build and test it on a real device.

### 1. Install dependencies and setup the local environment

[Follow these instructions](https://reactnative.dev/docs/environment-setup?guide=native) and make sure you have `node`, `watchman`, `Java Development Kit (JDK)`, and `Android development environment` set up.

### 2. Build local `.apk` file

Once everything is installed, run:

`yarn dev:mobile:build`

It will build the `.apk` file that you will need to install on your real device.

_Note:_ We cannot use Expo Go because of libraries that are not supported by Expo Go. Instead, we build a custom Expo Go dev client (our `.apk`).

### 3. Start Expo dev client

After you have installed the `.apk` file, run:

`yarn dev:mobile`

It will generate a QR code and a link below. You can connect your `.apk` to the dev client and make changes in the app in real-time with HMR.

_Note:_ Sometimes the generated URL might not work correctly and say that host is not resolved. In that case, it might be enough to take a look at the ending of the source URL: you should see something similar to http://192.168.86.238:8081 (ip and port might differ in your setup).

**Important:** HMR only works for the code changes. If you want to install new modules or change the existing configuration, you need to repeat step 2 - build `.apk` and install it on your device.

That's it!

Also, a few known cases that you might face:

#### 1. Sometimes while developing you might face such an error:

```
Invariant Violation: "main" has not been registered. This can happen if:

Metro (the local dev server) is run from the wrong folder. Check if Metro is running, stop it and restart it in the current project.

A module failed to load due to an error and AppRegistry.registerComponent wasn't called.
```

Since the app is configured correctly, that error might basically mean that some unhandled error occurred in your code so `registerRootComponent(App)` in the `App.tsx` was just not reached.
