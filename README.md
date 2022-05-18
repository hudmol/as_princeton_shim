# as_princeton_shim

An ArchivesSpace plugin that provides Princeton University with access to some
core features that they sponsored the development of before those features
appear in an official ArchivesSpace release.

This is necessary because Princeton is unable to deploy a custom ArchivesSpace
distribution.

This plugin is designed to run only against ArchivesSpace v3.2.0.

When upgrading to a future release of ArchivesSpace that includes the features,
this plugin should be removed and trashed.


## Installation

There are no special installation requirements. To install:

1.  Unpack the zip into your plugins directory
2.  Add the plugin to your `config.rb` like this: `AppConfig[:plugins] << 'as_princeton_shim'`
3.  Restart ArchivesSpace


## Configuration

There is no configuration required for this plugin.


## Features

- ANW-1495: Support for Local Access Restriction Type in spreadsheet importer
- ANW-1489: URIs in EAD exports
- NO  JIRA: Support for Local Access Restriction Type and structured restriction dates in RDE


----
Developed by Hudson Molonglo for Princeton University.

&copy; 2022 Hudson Molonglo Pty Ltd.

----
