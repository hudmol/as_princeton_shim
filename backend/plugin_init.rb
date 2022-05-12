# ANW-1489 include the record URI as unitid[@type=aspace_uri] in EAD exports
EADSerializer.class_eval do
  alias_method :pre_pu_shim_handle_arks, :handle_arks
  def handle_arks(data, xml)
    pre_pu_shim_handle_arks(data, xml)
    xml.unitid ({ 'type' => 'aspace_uri' }) { xml.text data.uri }
  end
end

EAD3Serializer.class_eval do
  alias_method :pre_pu_shim_handle_arks, :handle_arks
  def handle_arks(data, xml)
    pre_pu_shim_handle_arks(data, xml)
    xml.unitid ({ 'localtype' => 'aspace_uri' }) { xml.text data.uri }
  end
end
# end ANW-1489

# ANW-1495 Add local access restriction type column to bulk import spreadsheet
require_relative 'lib/bulk_import/bulk_import_mixins'
require_relative 'lib/bulk_import/notes_handler'
# end ANW-1495
