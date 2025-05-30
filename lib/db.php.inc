<?php
/*
 * License - MIT
 * Author  - nareshv@
 * URL     - https://github.com/nareshv/table-view/
 */

/* base class */
abstract class DB
{
    public function __construct()
    {
    }
    public function getTableColumns($table)
    {
    }
    public function countRows($table, $expression)
    {
    }
    public function fetchRows($cols, $table, $limit, $offset, $expression)
    {
    }
    public function save($table, $key, $value)
    {
    }
}

/* specific to sqlite */
class MysqlDB extends DB
{
    public function __construct($host, $user, $pass, $dbname, $charset='utf8')
    {
        $this->pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=$charset", $user, $pass);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    public function getTableColumns($table)
    {
        $cols = array();
        try {
            foreach ($this->pdo->query("SHOW COLUMNS FROM $table")->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $cols[] = $row['Field'];
            }
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $cols = array();
        }
        return $cols;
    }
    public function countRows($table, $expression)
    {
        $e = '';
        $c = 0;
        try {
            if (strlen($expression) > 0) {
                $e   = 'where '.$this->cleanupExpression($expression);
            }
            $sql = "select count(*) from $table $e";
            $row = $this->pdo->query($sql)->fetch(PDO::FETCH_ASSOC);
            $c   = $row['count(*)'];
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $c = 0;
        }
        return $c;
    }
    private function cleanupExpression($expression) {
        return $expression;
    }
    public function fetchRows($cols, $table, $limit, $offset, $expression='')
    {
        $rows = array();
        try {
            $c    = implode(', ', $cols);
            $expr = '';
            if (strlen($expression) > 0) {
                $e    = $this->cleanupExpression($expression);
                $expr = 'where '.$e; // FIXME: sql-injection friendly. So, nothing can be done until query builder is created.
            }
            $sql  = "select $c from $table $expr limit $limit offset $offset";
            $rows = $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $rows = array();
        }
        return $rows;
    }
    public function save($table, $key, $value)
    {
        $rows = 0;
        try {
            $k    = $this->pdo->quote($key);
            $v    = $this->pdo->quote($value);
            $sql  = "update settings set value = $v where tab = $k";
            error_log(__LINE__.':'.$sql);
            $rows = $this->pdo->exec($sql);
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $rows = 0;
        }
        return $rows;
    }
}

/* specific to sqlite */
class SqliteDB extends DB
{
    public function __construct($file)
    {
        $this->pdo = new PDO("sqlite:$file");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    public function getTableColumns($table)
    {
        $cols = array();
        try {
            foreach ($this->pdo->query("PRAGMA table_info($table)")->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $cols[] = $row['name'];
            }
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $cols = array();
        }
        return $cols;
    }
    public function countRows($table, $expression)
    {
        $e = '';
        $c = 0;
        try {
            if (strlen($expression) > 0) {
                $e   = 'where '.$this->cleanupExpression($expression);
            }
            $sql = "select count(*) from $table $e";
            $row = $this->pdo->query($sql)->fetch(PDO::FETCH_ASSOC);
            $c   = $row['count(*)'];
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $c = 0;
        }
        return $c;
    }
    private function cleanupExpression($expression) {
        return $expression;
    }
    public function fetchRows($cols, $table, $limit, $offset, $expression='')
    {
        $rows = array();
        try {
            $c    = implode(', ', $cols);
            $expr = '';
            if (strlen($expression) > 0) {
                $e    = $this->cleanupExpression($expression);
                $expr = 'where '.$e; // FIXME: sql-injection friendly. So, nothing can be done until query builder is created.
            }
            $sql  = "select $c from $table $expr limit $limit offset $offset";
            $rows = $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $rows = array();
        }
        return $rows;
    }
    public function save($table, $key, $value)
    {
        $rows = 0;
        try {
            $k    = $this->pdo->quote($key);
            $v    = $this->pdo->quote($value);
            $sql  = "update settings set value = $v where tab = $k";
            $rows = $this->pdo->exec($sql);
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $rows = 0;
        }
        return $rows;
    }
}

/* specific to postgresql */
class PgsqlDB extends DB
{
    public $dbname;
    public function __construct($host, $user, $pass, $dbname, $charset='utf8')
    {

        $host2 = $host . " options='--client_encoding=$charset'";

        $this->pdo = new PDO("pgsql:host=$host2;dbname=$dbname", $user, $pass);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->dbname = $dbname;
    }
    public function getTableColumns($table)
    {
        $cols = array();
        try {
            foreach ($this->pdo->query("select column_name from information_schema.columns where table_catalog = '$this->dbname' and table_schem
a = 'public' and table_name = '$table' ")->fetchAll(PDO::FETCH_ASSOC) as $row) {
                //error_log('get cloumn = ' . $row['column_name'] . ' ');
                $cols[] = $row['column_name'];
            }
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $cols = array();
        }
        return $cols;
    }
    public function countRows($table, $expression)
    {
        $e = '';
        $c = 0;
        try {
            if (strlen($expression) > 0) {
                $e   = 'where '.$this->cleanupExpression($expression);
            }
            $sql = "select count(*) as cnt from $table $e";
            $row = $this->pdo->query($sql)->fetch(PDO::FETCH_ASSOC);
            $c   = $row['cnt'];
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $c = 0;
        }
        return $c;
    }
    private function cleanupExpression($expression) {
        return $expression;
    }
    public function fetchRows($cols, $table, $limit, $offset, $expression='')
    {
        $rows = array();
        try {
            $c    = implode(', ', $cols);
            $expr = '';
            if (strlen($expression) > 0) {
                $e    = $this->cleanupExpression($expression);
                $expr = 'where '.$e; // FIXME: sql-injection friendly. So, nothing can be done until query builder is created.
            }
            $sql  = "select $c from $table $expr limit $limit offset $offset";
            error_log("call sql = " . $sql . " ");
            $rows = $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $rows = array();
        }
        return $rows;
    }
    public function save($table, $key, $value)
    {
        $rows = 0;
        try {
            $k    = $this->pdo->quote($key);
            $v    = $this->pdo->quote($value);
            $sql  = "update settings set value = $v where tab = $k";
            error_log(__LINE__.':'.$sql);
            $rows = $this->pdo->exec($sql);
        } catch (PDOException $e) {
            error_log(__LINE__.':'.$e->getMessage());
            $rows = 0;
        }
        return $rows;
    }
}
