<?php

class ExportView
{
    public function __construct($settings)
    {
        $this->settings = $settings;
    }
    public function renderHeadings(&$out)
    {
        fputcsv($out, $this->settings['columns']);
    }
    public function renderBody(&$rows, &$out)
    {
        $newrows = array();
        if (!empty($rows)) {
            foreach ($rows as $idx => $row) {
                // This is to preserve the order.
                foreach ($this->settings['columns'] as $column) {
                    $newrows[$idx][] = $row[$column];
                }
            }
            foreach ($newrows as $row) {
                fputcsv($out, $row);
            }
        }
    }
    public function render(&$rows, $filename)
    {
        header("Content-type: application/octet-stream");
        header("Content-Disposition: attachment; filename=$filename");
        header("Pragma: no-cache");
        header("Expires: 0");

        $out = fopen('php://output', 'w');
        $this->renderHeadings($out);
        $this->renderBody($rows, $out);
        fclose($out);
    }

}

