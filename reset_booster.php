<?php
session_start();
unset($_SESSION["booster_saved"]);
echo "Session booster réinitialisée.";
