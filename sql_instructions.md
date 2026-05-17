Please run the following SQL command in your database to create the required table for the English learning module progress tracking:

```sql
CREATE TABLE IF NOT EXISTS `user_progress_en` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `materi_score` int(11) DEFAULT '0',
  `latihan_score` int(11) DEFAULT '0',
  `dialog_score` int(11) DEFAULT '0',
  `listening_score` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
