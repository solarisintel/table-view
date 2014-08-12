<?php

/* table renderer */
class TableView
{
    public function __construct($settings)
    {
        $this->settings = $settings;
    }
    public function renderHeadings()
    {
        $head  = '<thead>';
        foreach ($this->settings['columns'] as $column) {
            $head .= '<th>'.$column.'</th>';
        }
        $head .= '</thead>';

        return $head;
    }
    public function renderBody(&$rows)
    {
        if (!empty($rows)) {
            $body  = '<tbody>';
            foreach ($rows as $row) {
                $body .= '<tr>';
                // This is to preserve the order.
                foreach ($this->settings['columns'] as $column) {
                    $body .= '<td>'.$row[$column].'</td>';
                }
                $body .= '</tr>';
            }
            $body .= '</tbody>';
        } else {
            $body = '<tbody><tr><td>Error Fetching Records.</td></tr></tbody>';
        }

        return $body;
    }
    public function renderFooter($cur=0)
    {
        $limit = $this->settings['limit'];
        $offset= $this->settings['offset'];
        $total = $this->settings['total'];
        $cols  = count($this->settings['columns']);

        return "<tfoot><tr><th colspan='$cols'>Rows : $cur/$total [Limit : $limit, Offset : $offset]</th></tr></tfoot>";
    }
    public function render(&$rows)
    {
        $table = $this->renderHeadings();
        // $table.= $this->renderFooter(count($rows));
        $table.= $this->renderBody($rows);

        return $table;
    }
}
