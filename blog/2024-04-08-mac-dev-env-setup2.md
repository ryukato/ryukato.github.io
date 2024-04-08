---
slug: on-mac-developement-setup
title: on-mac-developement-setup
authors: ryukato
date: 2024-03-30 12:42:50
tags: [development, laptop-setup]
---

<!-- truncate -->

### Terminal setup

#### ZSH

##### Install

- `brew install zsh`
- `chsh -s $(which zsh)`

> Note
> If you see “chsh: /opt/homebrew/bin/zsh: non-standard shell” message on terminal, then please run below again.
>
> - `sudo sh -c "echo $(which zsh) >> /etc/shells"`
> - `chsh -s $(which zsh)`

#### Oh My ZSH

##### Install

- `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`

#### Powerlevel10k

##### Install

- `git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k`

##### Setup theme on ZSH

- open **.zshrc** file and replace value of **ZSH_THEME** with **powerlevel10k/powerlevel10k**
- follow steps to select each options

#### zsh-syntax-highlighting

##### Install

- `git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`
- Update **.zshrc** file with below
  - `plugins=( [plugins...] zsh-syntax-highlighting)`

> Note
> you can also enable zsh-syntax-highlighting by adding below line to **.zshrc** file.
>
> ```
> # zsh-syntax-higlighting
> source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
> ```

#### zsh-syntax-highlighting

##### Install

- `git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`
- Update **.zshrc** file with below
  - `plugins=( [plugins...] zsh-autosuggestions)`

> Note
> The configuration of zsh plugins will be like below if you have above both plugins.
> `plugins=(git zsh-syntax-highlighting zsh-autosuggestions)`

### Other utilities

#### ripgrep

##### Install

- `brew install ripgrep`

#### tree

##### install

- `brew install tree`

### Kotlin setup

#### Install

- `brew install kotlin`
- `kotlinc -version`
- `brew install kotlin-language-server`
