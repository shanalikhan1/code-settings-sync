# Settings Sync [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Synchronize%20your%20%40VisualStudio%20%40code%20Settings%20Across%20Multiple%20Machines%20using%20%40github%20GIST%20by%20%40itsShanKhan&url=https://github.com/shanalikhan/code-settings-sync&via=code&hashtags=code,vscode,SettingsSync,developers) [![Follow](https://img.shields.io/twitter/follow/itsShanKhan.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=itsShanKhan)

**Previously known as Visual Studio Code Settings Sync**

[![Version](https://vsmarketplacebadge.apphb.com/version/Shan.code-settings-sync.svg)](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) [![Travis](https://img.shields.io/travis/rust-lang/rust.svg)](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync)
[![Greenkeeper badge](https://badges.greenkeeper.io/shanalikhan/code-settings-sync.svg)](https://greenkeeper.io/)
[![Master course](https://img.shields.io/badge/Supported%20by-VSCode%20Power%20User%20Course%20%E2%86%92-gray.svg?colorA=444444&colorB=4F44D6)](https://t.co/8BEMyhpKU5?amp=1)

## Support

While being free and open source, if you find it useful, please consider supporting it by donating via PayPal or Open Collective. If you are using it in office as a team, please ask your company to support us via Open Collective from just 2\$ per month!

<table align="center" width="60%" border="0">
  <tr>
    <td>
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4W3EWHHBSYMM8&lc=IE&item_name=Code%20Settings%20Sync&item_number=visual%20studio%20code%20settings%20sync&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted">
          <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"/>
      </a>
      <br>
    </td>
      <td>
        <a href="https://opencollective.com/code-settings-sync/order/3848" target="_blank">
            <img src="https://opencollective.com/webpack/donate/button.png?color=blue" width=200 />
        </a>
          <br>
          *2$ Per Month
      </td>
  </tr>
</table>
<br>
 <a href="https://join.slack.com/t/codesettingssync/shared_invite/enQtNzQyODMzMzI5MDQ3LWNmZjVkZjE2YTg0MzY1Y2EyYzVmYThmNzg2YjZkNjhhZWY3ZTEzN2I3ZTAxMjkwNWU0ZjMyZGFhMjdiZDI3ODU">
<img src="https://i.imgur.com/1QWdtcX.png" alt="Drawing" style="width: 150px;"/>
</a>
<br>
<br>

**Type Sync in command Palette in order to view all commands.**

## Key Features

```
1. Use your GitHub account token and Gist.
2. Easy to Upload and Download on one click.
3. Show a summary page at the end with details about config and extensions effected.
4. Auto download Latest Settings on Startup.
5. Auto upload Settings on file change.
6. Share the Gist with other users and let them download your settings.
7. Supports GitHub Enterprise
8. Support pragmas with @sync keywords: host, os and env are supported.
9. GUI for changing settings / logging in
10. Allows you to Sync any file across your machines.
```

## It Syncs

```
All extensions and complete User Folder that Contains
1. Settings File
2. Keybinding File
3. Launch File
4. Snippets Folder
5. VSCode Extensions & Extensions Configurations
6. Workspaces Folder
```

## Shortcuts

```
1. Upload Key : Shift + Alt + U
2. Download Key : Shift + Alt + D

(on macOS: Shift + Option + U / Shift + Option + D)
```

## Configure Settings Sync


Settings Sync Configuration page will be opened automatically on code start and requires two things to setup:

1. GitHub Token
2. GitHub Gist Id

GitHub Token needs to be retrived by your GitHub account while Settings Sync creates GIST if you are first time user.

Following are the steps you need to perform to configure.

- Click on `Login with GitHub` .
- Login GitHub on Browser and close the browser tab once you get Success message.
- If you are using Settings Sync first time GIST will be created automatically when you upload your settings.
- If you already have GitHub Gist, new window will be opened to allow you to select the GitHub Gist or `Skip` to create new Gist.



![Login with GitHub](https://shanalikhan.github.io/img/login-with-github.png)


![Existing Gist](https://shanalikhan.github.io/img/existing-gist.png)


You can always **verify created gist** by going to `https://gist.github.com` and checking for a gist named `cloudSettings`


## Upload Your Settings

**Press Shift + Alt + U** (macOS: Shift + Option + U)

> Type ">Sync" In Command Palette into order download / upload

When downloading or uploading for the first time, the welcome page will automatically open, where you can configure the Settings Sync.

Once you select upload, after uploading the settings. You will see the Summary details with the list of each files and extensions uploaded.

## Download your Settings

**Press Shift + Alt + D** (macOS: Shift + Option + D)

> Type ">Sync" In Command Palette into order download / upload

When downloading or uploading for the first time, the welcome page will automatically open, where you can configure the Settings Sync.

Once you select download, after downloading. Settings Sync will display you Summary containing the list of each files and extension being downloaded.

New popup will be opened to allow you to restart the code to apply the settings.

## Reset Extension Settings

> Select **"> Sync : Reset Extension Settings"** in the Command Palette to reset your settings


## Settings

Settings can be changed through the settings page, which can be accessed through **"> Sync : Advanced Options > Open Settings Page"**

There are two types of settings in Settings Sync.
I will recommend you to read the configurations details [here](https://dev.to/shanalikhan/visual-studio-code-settings-sync-configurations-mn0).


### Gist Settings

Gist Settings are stored in `settings.json` file of Code.
You can customize the settings in gist settings like:

```
1. Configure Gist Id (Environment)
2. Configure auto upload / download for GitHub Gist
3. Configure extension sync behaviour
4. Configure force download
4. Configure force upload
6. Configure quiet sync
```

```json
    "sync.gist": "0c929b1a6c51015cdc9e0fe2e369ea4c",
    "sync.autoDownload": false,
    "sync.autoUpload": false,
    "sync.forceDownload": false,
    "sync.forceUpload": false,
    "sync.quietSync": false,
    "sync.removeExtensions": true,
    "sync.syncExtensions": true
```

### Global Settings

Global settings are present in `syncLocalSettings.json` inside `User` folder. These settings will be shared across multiple Gist Environments.


You can customize the sync:

```
1. Options by which files / folders and settings to exclude from upload.
2. Configure default Gist Environment name.
3. Replace the code settings after downloading.
4. Change the Gist description while creating new one in github.
5. Configure GitHub Enterprise Url
```

```json
{
    "ignoreUploadFiles": [
        "state.*",
        "syncLocalSettings.json",
        ".DS_Store",
        "sync.lock",
        "projects.json",
        "projects_cache_vscode.json",
        "projects_cache_git.json",
        "projects_cache_svn.json",
        "gpm_projects.json",
        "gpm-recentItems.json"
    ],
    "ignoreUploadFolders": [
        "workspaceStorage"
    ],
    "ignoreExtensions": [],
    "gistDescription": "Visual Studio Code Settings Sync Gist",
    "version": 340,
    "token": "YOUR_GITHUB_TOKEN",
    "downloadPublicGist": false,
    "supportedFileExtensions": [ "json", "code-snippets" ],
    "openTokenLink": true,
    "disableUpdateMessage": false,
    "lastUpload": null,
    "lastDownload": null,
    "githubEnterpriseUrl": null,
    "askGistDescription": false,
    "customFiles": {},
    "hostName": null,
    "universalKeybindings": false,
    "autoUploadDelay": 20
}
```

I will recommend you to read the configurations details [here](https://dev.to/shanalikhan/visual-studio-code-settings-sync-configurations-mn0).


## Features

### Toggle Auto-Upload on change

Auto-upload is **disabled by default**. When the settings are changed and saved this feature will automatically start the upload process and save the settings online.

Please make sure you have valid github Token and Gist available to make it work properly.

Select Command **"Sync : Advanced Options > Toggle Auto-Upload on Settings Change"** command to Turn ON / OFF the auto-upload.

### Toggle Auto Download

Auto Download is **disabled by default**. It will sync all the setting by default when the editor starts.
Please make sure you have valid github Token and Gist available to make it work properly.

Select Command **"Sync : Advanced Options > Toggle Auto-Download On Startup"** command to Turn ON / OFF the auto download.

### Toggle Force Download

Force Download is **disabled by default**. By default, extension won't download the latest settings if you already have the latest downloaded version, but sometimes when you delete some extension locally and don't upload the settings it will still show that you have latest versions by date or time checks, by turning this ON it will always download the cloud settings on startup.

Please make sure you have valid github Token and Gist available to make it work properly.

Select Command **"Sync : Advanced Options > Toggle Force Download"** command to Turn ON / OFF the force download.

### Toggle Force Upload

Force Upload is **disabled by default**. By default, extension won't upload the settings if the gist has newer or identical content. By turning this ON it will always upload without checking for newer settings in the gist.

Please make sure you have valid github Token and Gist available to make it work properly.

Select Command **"Sync : Advanced Options > Toggle Force Upload"** command to Turn ON / OFF the force upload.

### Toggle Summary

Summary is **enabled by default** which shows all files and extensions that are added or deleted on a single page.
You may turn it off in order to make a upload and download process clean and quiet.

Select Command **"Sync : Advanced Options > Show Summary Page On Upload / Download"** command to Turn ON / OFF the auto download.


### Custom Sync

Settings Sync allows you to sync the files other from `User` folder. For example, your workspace settings and much more. Its upon you to utilize the full potential of Settings Sync across your machines or your teams machines. Read about custom sync [here](https://github.com/shanalikhan/code-settings-sync/wiki/Custom-Sync).

### Sync Pragmas

You can even manage which settings you want to ignore from being upload or download. Settings Sync even allows you to manage your `home` and `office` computer specific settings even OS related settings in single GitHub Gist. Read details about [Sync Pragmas here](https://github.com/shanalikhan/code-settings-sync/wiki/Sync-Pragmas).

### Share Settings Across Teams & Users

If you are looking to share your settings. Read the details [here](https://dev.to/shanalikhan/how-to-share-your-visual-studio-code-settings-and-extensions-39k). Settings Sync needs to create new Public GitHub Gist to share your settings with other users.

### Troubleshooting

If you ever get into problem while setting up the Settings Sync. You can check our troubleshooting guide that cover those scenarios [here](https://github.com/shanalikhan/code-settings-sync/wiki/Troubleshooting), you can also add your solution there if its not available there to help other users.

## How To Contribute

You can contribute in different ways. Read the details [here](https://github.com/shanalikhan/code-settings-sync/blob/master/CONTRIBUTING.md)

**Fix and Earn** - You can also earn money by fixing the issues - Check the issues under bounty program [here](https://github.com/shanalikhan/code-settings-sync/labels/bounty).

## Credits

### Contributors

Thank you to all the people who have already contributed to Settings Sync!
<a href="https://github.com/shanalikhan/code-settings-sync/graphs/contributors"><img src="https://opencollective.com/code-settings-sync/contributors.svg?width=890" /></a>

### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/code-settings-sync#backer)]

<a href="https://opencollective.com/code-settings-sync#backers" target="_blank"><img src="https://opencollective.com/code-settings-sync/backers.svg?width=890"></a>
[<img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif">](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4W3EWHHBSYMM8&lc=IE&item_name=Code%20Settings%20Sync&item_number=visual%20studio%20code%20settings%20sync&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)

### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/code-settings-sync))

## [Contributors](https://github.com/shanalikhan/code-settings-sync/graphs/contributors)

# [Release Notes](https://shanalikhan.github.io/2016/05/14/Visual-studio-code-sync-settings-release-notes.html)

# License

[![Version](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/shanalikhan/code-settings-sync/blob/master/LICENSE)

[![Version](https://vsmarketplacebadge.apphb.com/version/Shan.code-settings-sync.svg)](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync)

[![Installs](https://vsmarketplacebadge.apphb.com/installs/Shan.code-settings-sync.svg)](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync)

[![Ratings](https://vsmarketplacebadge.apphb.com/rating/Shan.code-settings-sync.svg)](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync)

[![Master course](https://img.shields.io/badge/Supported%20by-VSCode%20Power%20User%20Course%20%E2%86%92-gray.svg?colorA=444444&colorB=4F44D6)](https://t.co/8BEMyhpKU5?amp=1)

<a href="https://join.slack.com/t/codesettingssync/shared_invite/enQtNzQyODMzMzI5MDQ3LWNmZjVkZjE2YTg0MzY1Y2EyYzVmYThmNzg2YjZkNjhhZWY3ZTEzN2I3ZTAxMjkwNWU0ZjMyZGFhMjdiZDI3ODU">
<img src="https://shanalikhan.github.io/img/slack.PNG" alt="Drawing" style="width: 150px;"/>
</a>
