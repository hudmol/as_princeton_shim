# ANW-1495 Add local access restriction type column to bulk import spreadsheet
require 'fileutils'

FileUtils.cp(File.join(File.dirname(__FILE__), 'templates', 'bulk_import_template.xlsx'), File.join(Rails.root, 'docs'))
FileUtils.cp(File.join(File.dirname(__FILE__), 'templates', 'bulk_import_template.csv'), File.join(Rails.root, 'docs'))
# end ANW-1495

# Restriction notes in RDE
begin
  target = Rails.root.parent.join('assets', 'resources.crud-c0d72760d8587a1710389ba9ab6393470ccacd996bbd040ccf378692c1e3c0f3.js')

  if target.exist?
    FileUtils.cp(File.join(File.dirname(__FILE__), 'assets', 'resources.crud-shimmed.js'),
                 target.to_s)
    $stderr.puts("*** RDE override applied successfully!")
  else
    $stderr.puts("*** ERROR: restriction_notes plugin failed to find file to override.")
    raise "restriction_notes could not apply"
  end
end
# End Restriction notes in RDE
