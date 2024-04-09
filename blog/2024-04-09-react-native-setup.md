---
slug: react-native dev setup
title: React Native Dev Setup
authors: ryukato
date: 2024-04-09 12:42:50
tags: [react-native, setup]
---

# React Native Dev Setup

## Setup

### Android setup

#### Rosetta for M1

If you are using M1(2 or 3), then please run below

```shell
sudo softwareupdate --install-rosetta --agree-to-license
```

#### Android studio

- Install
  - [macOS install](https://flutter-ko.dev/get-started/install/macos#install-android-studio)
    - [Android 스튜디오 및 앱 도구 다운로드 - Android 개발자  |  Android Studio  |  Android Developers](https://developer.android.com/studio?hl=ko)

### Flutter Install & setup

> Note
>
> I know this is all about react-native dev setup but we’d better install flutter to setup each platform such as android and iOS using flutter. Because it helps us do that in easy.
> So please install flutter first

- Install
  - ```shell
    brew install --cask flutter
    ```
- Install **Android SDK Command-line Tools (latest)**
  - ![](/assets/react-native/sdk-manager-menu.png)
  - ![](/assets/react-native/sdk-tools-install.png)
- agree on android-license
  - ```shell
    flutter doctor --android-licenses
    ```
- set **ANDROID_HOME** to path

  - open .zshrc or .bash_profile and copy below scripts and paste it to the file.
  - ```shell
    # android
    export ANDROID_HOME=~/Library/Android/sdk
    export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"

    ```

### iOS

#### cocoa pods

- Install

  - ```shell
    sudo gem install drb -v 2.0.6
    sudo gem install activesupport -v 6.1.7.7
    gem install cocoapods --user-install
    gem which cocoapods

    # check the result
    ~/.gem/ruby/2.6.0/gems/cocoapods-1.15.2/lib/cocoapods.rb
    ```

#### Xcode

- Install
  - Go to AppStore
  - Run Xcode
  - Run beloe
  - ```shell
    sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
    sudo xcodebuild -runFirstLaunch
    ```
- Create a simulator
  - Open Simulator
    - Go to Xcode
    - Select **Open Developer Tool** and select **Simulator**
    - ![](/assets/react-native/xcode-open-simulator.png)

Note

> How to get iOS for a simulator
>
> - Open Xcode
> - Go to Xcode and select **Settings**
> - Move to **Platoforms** tab
> - Get a version for each platform
>   ![](/assets/react-native/install-ios-version.png)

### Other tools

#### watchman

- Install
  - ```shell
    brew install watchman
    ```

### VS-Code for React-native

#### Extensions

- React Native Tools
  - [React Native Tools - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)
-
- Babel JavaScript
  - https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native
- Flow Language Support
  - [Flow Language Support - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode)
- ESLint
  - [ESLint - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- Prettier - Code formatter
  - https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
