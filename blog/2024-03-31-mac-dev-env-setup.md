---
slug: on-mac-developement-setup 
title: on-mac-developement-setup 
authors: ryukato
date: 2024-03-30 12:42:50
tags: [development, laptop-setup]
---

How to setup development laptop or pc
<!-- truncate -->


# Development local setup
## Mac
### Mac package manager
#### Homebrew
* Homepage: https://brew.sh
##### Install
* `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

### Git
On mac, we don't need to install this because `git` is installed as default.
* install
  * `brew install git`

#### SSH Finger print setup
* Create `.ssh` directory under your local account
  * `cd`
  * `mkdir .ssh`
  * `cd .ssh``
* Create new ssh key
  * `ssh-keygen -t ed25519 -C "your_email@example.com"`
 
* Add the new key to ssh-agent
  * `eval "$(ssh-agent -s)"`
  * `touch ~/.ssh/config` & edit the `.ssh/config` file to have below (**Please make sure the file name is same with the created one above**)
  ```
  Host github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
  ```
* Add the key to key-chain
  * `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`
* Go to https://github.com & login
* Go to **Setting** of your github account & select **SSH & GPG Keys**
  * Select **NEW SSH key**
  * Set `title` with whatever you want
  * Run & copy of the result
    * `cat ~/.ssh/id_ed25519.pub`
  * Paste it as new ssh key on github.


> Note
> 
> If there is something wrong or an error, then please refer to https://docs.github.com/ko/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent.
> And please enter **yes** for the question - "Are you sure you want to continue connecting (yes/no)?" while you try to clone a github repository.


### Language runtime
#### SDK Man
* Homepage: https://sdkman.io

##### Install
* `curl -s "https://get.sdkman.io" | bash`
* `source "$HOME/.sdkman/bin/sdkman-init.sh"`
##### How to use
* list-up available java versions
  * `sdk list java`
* install java 17
  * `sdk install java 17.0.10-zulu`
* check
  * `javac --version`
  * `java --version`

#### Node Version Manager (nvm)
##### Install
* `brew install nvm`
* `export NVM_DIR="$HOME/.nvm"`
* `[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"`
* `[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"`
* check
  * `nvm --version`
##### How to use
* list-up installed nodejs on local 
  * `nvm list`

* list-up available nodejs 
  * `nvm ls-remote`

* install new version of nodejs ( **Please install latest stable version (LTS)** )
  * `nvm install [version of nodejs]`

#### NodeJS
* install
  * `nvm install v20.12.0`
  * `nvm use v20.12.0`

* check
  * `node --version`
  * `npm --version`

### Utilities
#### Editor
##### neovim
* install
  * `brew install neovim`
* basic config
  * `git clone https://github.com/ryukato/.dotfile ~/.config`
* run 
  * `nvim`
  * To install plugins, please press `Shift + i` once you can see "**Lazy Plugin manager**"
  * To install plugins, please press `Shift + u` once you can see "**Lazy Plugin manager**"

> Note
> 
> You can run LazyPluginManager of neovim by doing as followings.
* Please open neovim by running `nvim`
* Press `Shift + ;`, and enter `Lazy`


#### Terminal
##### warp
* `brew install warp`

#### Nerd Font
* download
  * https://www.nerdfonts.com/font-downloads

#### Git
##### LazyGit
* homepage: https://github.com/jesseduffield/lazygit
* install
  * `brew install lazygit`

## Window
