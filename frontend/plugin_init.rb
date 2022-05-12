# ANW-1495 Add local access restriction type column to bulk import spreadsheet
require 'fileutils'

FileUtils.cp(File.join(File.dirname(__FILE__), 'templates', 'bulk_import_template.xlsx'), File.join(Rails.root, 'docs'))
FileUtils.cp(File.join(File.dirname(__FILE__), 'templates', 'bulk_import_template.csv'), File.join(Rails.root, 'docs'))
# end ANW-1495
