'use client';

import Footer from '@/components/Footer';
import { NavbarTailwindCss } from '@/components/Navbar';
import Section from '@/components/Section';
import { asmaulHusnaApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const ASMAUL_HUSNA = [
    { number: 1, arabic: 'الرَّحْمَن', transliteration: 'Ar-Rahman', indonesian: 'Yang Maha Pengasih', english: 'The Most Gracious', description: 'Allah memberi kasih sayang kepada seluruh makhluk-Nya di dunia, baik yang beriman maupun tidak.' },
    { number: 2, arabic: 'الرَّحِيم', transliteration: 'Ar-Rahim', indonesian: 'Yang Maha Penyayang', english: 'The Most Merciful', description: 'Allah memberikan rahmat khusus hanya kepada orang-orang beriman di akhirat.' },
    { number: 3, arabic: 'الْمَلِك', transliteration: 'Al-Malik', indonesian: 'Yang Maha Merajai', english: 'The King', description: 'Allah adalah Raja yang sesungguhnya, memiliki kerajaan langit dan bumi.' },
    { number: 4, arabic: 'الْقُدُّوس', transliteration: 'Al-Quddus', indonesian: 'Yang Maha Suci', english: 'The Most Pure', description: 'Allah Maha Suci dari segala kekurangan, kelemahan, dan sifat-sifat yang tidak layak.' },
    { number: 5, arabic: 'السَّلَام', transliteration: 'As-Salam', indonesian: 'Yang Maha Memberi Keselamatan', english: 'The Source of Peace', description: 'Allah selamat dari segala kekurangan dan Allah-lah sumber keselamatan bagi makhluk-Nya.' },
    { number: 6, arabic: 'الْمُؤْمِن', transliteration: "Al-Mu'min", indonesian: 'Yang Maha Pemberi Keamanan', english: 'The Guardian of Faith', description: 'Allah memberikan rasa aman dan ketenangan kepada hamba-hamba-Nya.' },
    { number: 7, arabic: 'الْمُهَيْمِن', transliteration: 'Al-Muhaymin', indonesian: 'Yang Maha Mengawasi', english: 'The Overseer', description: 'Allah senantiasa mengawasi, memelihara, dan menjaga seluruh makhluk-Nya.' },
    { number: 8, arabic: 'الْعَزِيز', transliteration: 'Al-Aziz', indonesian: 'Yang Maha Perkasa', english: 'The Almighty', description: 'Allah Maha Perkasa yang tidak dapat dikalahkan oleh siapapun.' },
    { number: 9, arabic: 'الْجَبَّار', transliteration: 'Al-Jabbar', indonesian: 'Yang Maha Menundukkan', english: 'The Compeller', description: 'Allah berkuasa memaksakan kehendak-Nya atas semua makhluk.' },
    { number: 10, arabic: 'الْمُتَكَبِّر', transliteration: 'Al-Mutakabbir', indonesian: 'Yang Memiliki Kebesaran', english: 'The Greatest', description: 'Hanya Allah yang berhak memiliki sifat Maha Besar atas segala sesuatu.' },
    { number: 11, arabic: 'الْخَالِق', transliteration: 'Al-Khaliq', indonesian: 'Yang Maha Pencipta', english: 'The Creator', description: 'Allah menciptakan segala sesuatu dari tidak ada menjadi ada.' },
    { number: 12, arabic: 'الْبَارِئ', transliteration: "Al-Bari'", indonesian: 'Yang Maha Melepaskan', english: 'The Originator', description: 'Allah menciptakan makhluk yang terlepas dan berbeda satu sama lain.' },
    { number: 13, arabic: 'الْمُصَوِّر', transliteration: 'Al-Musawwir', indonesian: 'Yang Maha Membentuk Rupa', english: 'The Fashioner', description: 'Allah membentuk rupa setiap makhluk sesuai kehendak-Nya.' },
    { number: 14, arabic: 'الْغَفَّار', transliteration: 'Al-Ghaffar', indonesian: 'Yang Maha Pengampun', english: 'The Ever-Forgiving', description: 'Allah selalu dan berulang-ulang mengampuni dosa-dosa hamba-Nya.' },
    { number: 15, arabic: 'الْقَهَّار', transliteration: 'Al-Qahhar', indonesian: 'Yang Maha Mengalahkan', english: 'The Subduer', description: 'Allah berkuasa atas segala sesuatu dan tidak ada yang dapat mengalahkan-Nya.' },
    { number: 16, arabic: 'الْوَهَّاب', transliteration: 'Al-Wahhab', indonesian: 'Yang Maha Pemberi', english: 'The Giver of All', description: 'Allah memberi dengan melimpah tanpa imbalan dan tanpa batas.' },
    { number: 17, arabic: 'الرَّزَّاق', transliteration: 'Ar-Razzaq', indonesian: 'Yang Maha Pemberi Rezeki', english: 'The Sustainer', description: 'Allah yang memberikan rezeki kepada seluruh makhluk-Nya.' },
    { number: 18, arabic: 'الْفَتَّاح', transliteration: 'Al-Fattah', indonesian: 'Yang Maha Pembuka', english: 'The Opener', description: 'Allah membuka pintu rahmat, rezeki, dan kemenangan bagi hamba-Nya.' },
    { number: 19, arabic: 'الْعَلِيم', transliteration: 'Al-Alim', indonesian: 'Yang Maha Mengetahui', english: 'The All-Knowing', description: 'Allah mengetahui segala sesuatu yang tersembunyi maupun yang tampak.' },
    { number: 20, arabic: 'الْقَابِض', transliteration: 'Al-Qabidh', indonesian: 'Yang Maha Menyempitkan', english: 'The Restrainer', description: 'Allah menyempitkan dan menahan rezeki bagi siapa yang dikehendaki-Nya.' },
    { number: 21, arabic: 'الْبَاسِط', transliteration: 'Al-Basit', indonesian: 'Yang Maha Melapangkan', english: 'The Expander', description: 'Allah melapangkan rezeki bagi siapa yang dikehendaki-Nya.' },
    { number: 22, arabic: 'الْخَافِض', transliteration: 'Al-Khafidh', indonesian: 'Yang Maha Merendahkan', english: 'The Abaser', description: 'Allah merendahkan derajat siapa yang dikehendaki-Nya.' },
    { number: 23, arabic: 'الرَّافِع', transliteration: "Ar-Rafi'", indonesian: 'Yang Maha Meninggikan', english: 'The Exalter', description: 'Allah meninggikan derajat siapa yang dikehendaki-Nya.' },
    { number: 24, arabic: 'الْمُعِزُّ', transliteration: "Al-Mu'izz", indonesian: 'Yang Maha Memuliakan', english: 'The Giver of Honor', description: 'Allah memberikan kemuliaan dan kehormatan kepada siapa yang dikehendaki-Nya.' },
    { number: 25, arabic: 'الْمُذِلُّ', transliteration: 'Al-Mudzill', indonesian: 'Yang Maha Menghinakan', english: 'The Giver of Dishonor', description: 'Allah menghinakan siapa yang dikehendaki-Nya karena hikmah-Nya.' },
    { number: 26, arabic: 'السَّمِيع', transliteration: 'As-Sami', indonesian: 'Yang Maha Mendengar', english: 'The All-Hearing', description: 'Allah mendengar semua suara dan perkataan makhluk-Nya.' },
    { number: 27, arabic: 'الْبَصِير', transliteration: 'Al-Bashir', indonesian: 'Yang Maha Melihat', english: 'The All-Seeing', description: 'Allah melihat segala sesuatu, yang tampak maupun tersembunyi.' },
    { number: 28, arabic: 'الْحَكَم', transliteration: 'Al-Hakam', indonesian: 'Yang Maha Menetapkan', english: 'The Judge', description: 'Allah adalah hakim yang menetapkan hukum dengan adil.' },
    { number: 29, arabic: 'الْعَدْل', transliteration: 'Al-Adl', indonesian: 'Yang Maha Adil', english: 'The Just', description: 'Allah Maha Adil dalam segala keputusan dan perbuatan-Nya.' },
    { number: 30, arabic: 'اللَّطِيف', transliteration: 'Al-Latif', indonesian: 'Yang Maha Lembut', english: 'The Subtle One', description: 'Allah Maha Lembut dalam mengetahui segala sesuatu yang halus dan tersembunyi.' },
    { number: 31, arabic: 'الْخَبِير', transliteration: 'Al-Khabir', indonesian: 'Yang Maha Mengenal', english: 'The All-Aware', description: 'Allah Maha Mengenal setiap detail dari sesuatu yang ada.' },
    { number: 32, arabic: 'الْحَلِيم', transliteration: 'Al-Halim', indonesian: 'Yang Maha Penyantun', english: 'The Forbearing', description: 'Allah tidak tergesa-gesa menghukum orang yang berdosa dan memberikan kesempatan bertaubat.' },
    { number: 33, arabic: 'الْعَظِيم', transliteration: 'Al-Azhim', indonesian: 'Yang Maha Agung', english: 'The Magnificent', description: 'Allah memiliki keagungan yang paling sempurna dalam segala hal.' },
    { number: 34, arabic: 'الْغَفُور', transliteration: 'Al-Ghafur', indonesian: 'Yang Maha Pengampun', english: 'The All-Forgiving', description: 'Allah mengampuni dosa-dosa hamba-Nya yang bertaubat.' },
    { number: 35, arabic: 'الشَّكُور', transliteration: 'Asy-Syakur', indonesian: 'Yang Maha Mensyukuri', english: 'The Appreciative', description: 'Allah membalas amal kebaikan hamba-Nya dengan balasan yang berlipat ganda.' },
    { number: 36, arabic: 'الْعَلِيُّ', transliteration: 'Al-Aliyy', indonesian: 'Yang Maha Tinggi', english: 'The Most High', description: 'Allah Maha Tinggi dalam Dzat, kekuasaan, dan kedudukan-Nya.' },
    { number: 37, arabic: 'الْكَبِير', transliteration: 'Al-Kabir', indonesian: 'Yang Maha Besar', english: 'The Greatest', description: 'Allah Maha Besar dalam segala keagungan dan kesempurnaan.' },
    { number: 38, arabic: 'الْحَفِيظ', transliteration: 'Al-Hafizh', indonesian: 'Yang Maha Memelihara', english: 'The Preserver', description: 'Allah memelihara dan menjaga seluruh makhluk-Nya dari kerusakan.' },
    { number: 39, arabic: 'الْمُقِيت', transliteration: 'Al-Muqit', indonesian: 'Yang Maha Pemberi Kecukupan', english: 'The Nourisher', description: 'Allah memberikan makanan dan kecukupan kepada semua makhluk-Nya.' },
    { number: 40, arabic: 'الْحَسِيب', transliteration: 'Al-Hasib', indonesian: 'Yang Maha Membuat Perhitungan', english: 'The Reckoner', description: 'Allah memperhitungkan dan mencatat seluruh amal perbuatan makhluk-Nya.' },
    { number: 41, arabic: 'الْجَلِيل', transliteration: 'Al-Jalil', indonesian: 'Yang Maha Luhur', english: 'The Sublime', description: 'Allah memiliki kemuliaan dan keluhuran yang tidak tertandingi.' },
    { number: 42, arabic: 'الْكَرِيم', transliteration: 'Al-Karim', indonesian: 'Yang Maha Pemurah', english: 'The Generous', description: 'Allah Maha Pemurah dan dermawan, pemberian-Nya tidak pernah habis.' },
    { number: 43, arabic: 'الرَّقِيب', transliteration: 'Ar-Raqib', indonesian: 'Yang Maha Mengawasi', english: 'The Watchful', description: 'Allah senantiasa mengawasi setiap gerak dan amal perbuatan makhluk-Nya.' },
    { number: 44, arabic: 'الْمُجِيب', transliteration: 'Al-Mujib', indonesian: 'Yang Maha Mengabulkan', english: 'The Responsive', description: 'Allah mengabulkan setiap doa dan permohonan hamba-Nya.' },
    { number: 45, arabic: 'الْوَاسِع', transliteration: 'Al-Wasi', indonesian: 'Yang Maha Luas', english: 'The All-Encompassing', description: 'Ilmu, rahmat, dan kekuasaan Allah tidak terbatas dan meliputi segalanya.' },
    { number: 46, arabic: 'الْحَكِيم', transliteration: 'Al-Hakim', indonesian: 'Yang Maha Bijaksana', english: 'The All-Wise', description: 'Allah Maha Bijaksana dalam setiap ciptaan dan ketentuan-Nya.' },
    { number: 47, arabic: 'الْوَدُود', transliteration: 'Al-Wadud', indonesian: 'Yang Maha Mencintai', english: 'The Loving', description: 'Allah mencintai hamba-hamba-Nya yang beriman dan beramal shalih.' },
    { number: 48, arabic: 'الْمَجِيد', transliteration: 'Al-Majid', indonesian: 'Yang Maha Mulia', english: 'The Most Glorious', description: 'Allah memiliki kemuliaan yang sempurna dan bersifat abadi.' },
    { number: 49, arabic: 'الْبَاعِث', transliteration: "Al-Ba'ith", indonesian: 'Yang Maha Membangkitkan', english: 'The Resurrector', description: 'Allah yang membangkitkan kembali seluruh makhluk setelah mati di hari kiamat.' },
    { number: 50, arabic: 'الشَّهِيد', transliteration: 'Asy-Syahid', indonesian: 'Yang Maha Menyaksikan', english: 'The Witness', description: 'Allah menyaksikan segala sesuatu yang terjadi di langit dan di bumi.' },
    { number: 51, arabic: 'الْحَق', transliteration: 'Al-Haqq', indonesian: 'Yang Maha Benar', english: 'The Truth', description: 'Allah adalah kebenaran sejati yang keberadaan-Nya pasti dan tidak diragukan.' },
    { number: 52, arabic: 'الْوَكِيل', transliteration: 'Al-Wakil', indonesian: 'Yang Maha Memelihara', english: 'The Trustee', description: 'Allah adalah sebaik-baik penolong dan penjamin bagi hamba yang bertawakkal.' },
    { number: 53, arabic: 'الْقَوِيُّ', transliteration: 'Al-Qawiyy', indonesian: 'Yang Maha Kuat', english: 'The All-Powerful', description: 'Allah memiliki kekuatan yang sempurna dan tidak ada yang bisa mengalahkan-Nya.' },
    { number: 54, arabic: 'الْمَتِين', transliteration: 'Al-Matin', indonesian: 'Yang Maha Kokoh', english: 'The Forceful One', description: 'Allah memiliki kekuatan yang kokoh dan teguh, tidak pernah melemah.' },
    { number: 55, arabic: 'الْوَلِيُّ', transliteration: 'Al-Waliyy', indonesian: 'Yang Maha Melindungi', english: 'The Protecting Friend', description: 'Allah adalah pelindung dan penolong orang-orang yang beriman.' },
    { number: 56, arabic: 'الْحَمِيد', transliteration: 'Al-Hamid', indonesian: 'Yang Maha Terpuji', english: 'The Praiseworthy', description: 'Allah terpuji atas segala nikmat dan anugerah yang diberikan kepada makhluk-Nya.' },
    { number: 57, arabic: 'الْمُحْصِي', transliteration: 'Al-Muhshi', indonesian: 'Yang Maha Menghitung', english: 'The Appraiser', description: 'Allah menghitung dan mencatat semua amal perbuatan makhluk hingga yang sekecil-kecilnya.' },
    { number: 58, arabic: 'الْمُبْدِئ', transliteration: 'Al-Mubdi', indonesian: 'Yang Maha Memulai', english: 'The Originator', description: 'Allah memulai penciptaan dari tidak ada menjadi ada tanpa contoh sebelumnya.' },
    { number: 59, arabic: 'الْمُعِيد', transliteration: "Al-Mu'id", indonesian: 'Yang Maha Mengembalikan', english: 'The Restorer', description: 'Allah mengembalikan makhluk setelah mati ke kehidupan kembali.' },
    { number: 60, arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi', indonesian: 'Yang Maha Menghidupkan', english: 'The Giver of Life', description: 'Allah yang memberikan kehidupan kepada setiap makhluk.' },
    { number: 61, arabic: 'الْمُمِيت', transliteration: 'Al-Mumit', indonesian: 'Yang Maha Mematikan', english: 'The Taker of Life', description: 'Allah yang mematikan setiap makhluk sesuai waktu yang telah ditentukan.' },
    { number: 62, arabic: 'الْحَيُّ', transliteration: 'Al-Hayy', indonesian: 'Yang Maha Hidup', english: 'The Ever-Living', description: 'Allah hidup abadi tanpa permulaan dan tanpa akhir.' },
    { number: 63, arabic: 'الْقَيُّوم', transliteration: 'Al-Qayyum', indonesian: 'Yang Maha Berdiri Sendiri', english: 'The Self-Subsisting', description: 'Allah tidak membutuhkan siapapun dan semua makhluk bergantung kepada-Nya.' },
    { number: 64, arabic: 'الْوَاجِد', transliteration: 'Al-Wajid', indonesian: 'Yang Maha Menemukan', english: 'The Finder', description: 'Allah Maha Kaya dan menemukan apa yang dikehendaki tanpa kesulitan.' },
    { number: 65, arabic: 'الْمَاجِد', transliteration: 'Al-Majid', indonesian: 'Yang Maha Mulia', english: 'The Glorious', description: 'Allah memiliki kemuliaan yang agung dalam segala sifat-Nya.' },
    { number: 66, arabic: 'الْوَاحِد', transliteration: 'Al-Wahid', indonesian: 'Yang Maha Esa', english: 'The Unique', description: 'Allah satu-satunya, tidak ada sekutu dan tidak ada yang serupa dengan-Nya.' },
    { number: 67, arabic: 'الأَحَد', transliteration: 'Al-Ahad', indonesian: 'Yang Tunggal', english: 'The One', description: 'Allah Esa dalam Dzat, sifat, dan perbuatan-Nya.' },
    { number: 68, arabic: 'الصَّمَد', transliteration: 'As-Samad', indonesian: 'Yang Maha Dibutuhkan', english: 'The Eternal', description: 'Semua makhluk membutuhkan Allah, sedangkan Allah tidak membutuhkan siapapun.' },
    { number: 69, arabic: 'الْقَادِر', transliteration: 'Al-Qadir', indonesian: 'Yang Maha Berkuasa', english: 'The All-Powerful', description: 'Allah berkuasa atas segala sesuatu sesuai kehendak-Nya.' },
    { number: 70, arabic: 'الْمُقْتَدِر', transliteration: 'Al-Muqtadir', indonesian: 'Yang Maha Kuasa', english: 'The Dominant', description: 'Allah memiliki kekuasaan penuh dan mutlak atas segala sesuatu.' },
    { number: 71, arabic: 'الْمُقَدِّم', transliteration: 'Al-Muqaddim', indonesian: 'Yang Maha Mendahulukan', english: 'The Expediter', description: 'Allah mendahulukan siapa yang dikehendaki-Nya dalam derajat dan kemuliaan.' },
    { number: 72, arabic: 'الْمُؤَخِّر', transliteration: 'Al-Muakhkhir', indonesian: 'Yang Maha Mengakhirkan', english: 'The Delayer', description: 'Allah mengakhirkan dan menangguhkan sesuai hikmah dan kehendak-Nya.' },
    { number: 73, arabic: 'الأَوَّل', transliteration: 'Al-Awwal', indonesian: 'Yang Maha Awal', english: 'The First', description: 'Allah adalah Yang Pertama, sebelum-Nya tidak ada sesuatupun.' },
    { number: 74, arabic: 'الآخِر', transliteration: 'Al-Akhir', indonesian: 'Yang Maha Akhir', english: 'The Last', description: 'Allah adalah Yang Terakhir, setelah-Nya tidak ada sesuatupun.' },
    { number: 75, arabic: 'الظَّاهِر', transliteration: 'Az-Zhahir', indonesian: 'Yang Maha Nyata', english: 'The Manifest', description: 'Allah nyata dengan bukti-bukti kekuasaan-Nya yang tersebar di alam semesta.' },
    { number: 76, arabic: 'الْبَاطِن', transliteration: 'Al-Batin', indonesian: 'Yang Maha Tersembunyi', english: 'The Hidden', description: 'Dzat Allah tersembunyi dan tidak dapat dijangkau oleh pandangan atau pikiran makhluk.' },
    { number: 77, arabic: 'الْوَالِي', transliteration: 'Al-Wali', indonesian: 'Yang Maha Penguasa', english: 'The Governor', description: 'Allah mengurus dan mengelola seluruh urusan alam semesta.' },
    { number: 78, arabic: 'الْمُتَعَالِي', transliteration: "Al-Muta'ali", indonesian: 'Yang Maha Mulia', english: 'The Self Exalted', description: 'Allah Maha Tinggi dan Mulia di atas segala kekurangan dan kelemahan.' },
    { number: 79, arabic: 'الْبَرُّ', transliteration: 'Al-Barr', indonesian: 'Yang Maha Pelimpah Kebaikan', english: 'The Source of All Goodness', description: 'Allah memberikan kebaikan dan kebajikan kepada seluruh makhluk-Nya.' },
    { number: 80, arabic: 'التَّوَّاب', transliteration: 'At-Tawwab', indonesian: 'Yang Maha Penerima Tobat', english: 'The Ever-Returning', description: 'Allah selalu menerima tobat hamba yang benar-benar kembali kepada-Nya.' },
    { number: 81, arabic: 'الْمُنْتَقِم', transliteration: 'Al-Muntaqim', indonesian: 'Yang Maha Pemberi Balasan', english: 'The Avenger', description: 'Allah membalas siapa yang berbuat zalim dan melanggar batas-batas-Nya.' },
    { number: 82, arabic: 'الْعَفُوُّ', transliteration: 'Al-Afuww', indonesian: 'Yang Maha Pemaaf', english: 'The Pardoner', description: 'Allah menghapus dosa-dosa hamba yang bertaubat dan memohon ampunan.' },
    { number: 83, arabic: 'الرَّؤُوف', transliteration: "Ar-Ra'uf", indonesian: 'Yang Maha Pengasih', english: 'The Most Kind', description: 'Allah memiliki belas kasih yang sangat lembut kepada hamba-hamba-Nya.' },
    { number: 84, arabic: 'مَالِكُ الْمُلْك', transliteration: 'Malik-ul-Mulk', indonesian: 'Yang Maha Penguasa Kerajaan', english: 'Owner of All Sovereignty', description: 'Allah adalah pemilik dan penguasa mutlak seluruh kerajaan di alam semesta.' },
    { number: 85, arabic: 'ذُو الْجَلَالِ وَالإِكْرَام', transliteration: 'Dzul Jalali Wal Ikram', indonesian: 'Yang Maha Memiliki Keagungan dan Kemuliaan', english: 'Lord of Majesty and Generosity', description: 'Allah memiliki keagungan yang sempurna dan kemuliaan yang tidak tertandingi.' },
    { number: 86, arabic: 'الْمُقْسِط', transliteration: 'Al-Muqsit', indonesian: 'Yang Maha Adil', english: 'The Equitable', description: 'Allah berlaku adil dalam setiap keputusan dan tidak pernah menzalimi makhluk-Nya.' },
    { number: 87, arabic: 'الْجَامِع', transliteration: 'Al-Jami', indonesian: 'Yang Maha Mengumpulkan', english: 'The Gatherer', description: 'Allah mengumpulkan seluruh makhluk di hari kiamat untuk dihisab.' },
    { number: 88, arabic: 'الْغَنِيُّ', transliteration: 'Al-Ghani', indonesian: 'Yang Maha Kaya', english: 'The Self-Sufficient', description: 'Allah Maha Kaya dan tidak membutuhkan apapun dari makhluk-Nya.' },
    { number: 89, arabic: 'الْمُغْنِي', transliteration: 'Al-Mughni', indonesian: 'Yang Maha Memperkaya', english: 'The Enricher', description: 'Allah yang memberikan kekayaan dan kecukupan kepada siapa yang dikehendaki.' },
    { number: 90, arabic: 'الْمَانِع', transliteration: 'Al-Mani', indonesian: 'Yang Maha Mencegah', english: 'The Preventer', description: 'Allah mencegah dan menahan sesuai dengan hikmah dan kehendak-Nya.' },
    { number: 91, arabic: 'الضَّارُّ', transliteration: 'Ad-Dharr', indonesian: 'Yang Maha Pemberi Mudharat', english: 'The Distresser', description: 'Allah yang mendatangkan kesulitan kepada siapa yang dikehendaki-Nya sebagai ujian.' },
    { number: 92, arabic: 'النَّافِع', transliteration: "An-Nafi'", indonesian: 'Yang Maha Pemberi Manfaat', english: 'The Propitious', description: 'Allah yang memberikan manfaat dan kebaikan kepada siapa yang dikehendaki-Nya.' },
    { number: 93, arabic: 'النُّور', transliteration: 'An-Nur', indonesian: 'Yang Maha Bercahaya', english: 'The Light', description: 'Allah adalah cahaya langit dan bumi yang menerangi segala yang ada.' },
    { number: 94, arabic: 'الْهَادِي', transliteration: 'Al-Hadi', indonesian: 'Yang Maha Pemberi Petunjuk', english: 'The Guide', description: 'Allah memberikan petunjuk kepada siapa yang dikehendaki-Nya menuju jalan yang benar.' },
    { number: 95, arabic: 'الْبَدِيع', transliteration: "Al-Badi'", indonesian: 'Yang Maha Pencipta', english: 'The Originator', description: 'Allah menciptakan sesuatu yang baru tanpa contoh dan tanpa bahan sebelumnya.' },
    { number: 96, arabic: 'الْبَاقِي', transliteration: 'Al-Baqi', indonesian: 'Yang Maha Kekal', english: 'The Everlasting', description: 'Allah kekal abadi, tidak akan pernah binasa atau berakhir.' },
    { number: 97, arabic: 'الْوَارِث', transliteration: 'Al-Warith', indonesian: 'Yang Maha Mewarisi', english: 'The Inheritor of All', description: 'Setelah semua makhluk binasa, hanya Allah yang tetap ada dan mewarisi segalanya.' },
    { number: 98, arabic: 'الرَّشِيد', transliteration: 'Ar-Rasyid', indonesian: 'Yang Maha Pandai', english: 'The Guide to the Right Path', description: 'Allah Maha Bijaksana dalam mengatur seluruh urusan alam semesta.' },
    { number: 99, arabic: 'الصَّبُور', transliteration: 'As-Shabur', indonesian: 'Yang Maha Sabar', english: 'The Patient', description: 'Allah tidak tergesa-gesa menghukum makhluk yang berdosa dan memberi kesempatan bertaubat.' },
];

const AsmaulHusnaPage = () => {
    const [names, setNames] = useState(ASMAUL_HUSNA);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        asmaulHusnaApi
            .list()
            .then((r) => r.json())
            .then((data) => {
                const items = data?.items ?? data ?? [];
                if (items.length > 0) setNames(items);
            })
            .catch(() => {});
    }, []);

    const filteredNames = names.filter((name) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
            name.arabic.includes(query) ||
            name.transliteration.toLowerCase().includes(query) ||
            name.indonesian.toLowerCase().includes(query) ||
            name.english.toLowerCase().includes(query)
        );
    });

    return (
        <main className='min-h-screen flex flex-col'>
            <NavbarTailwindCss />
            <Section>
                <div className='container mx-auto px-4 max-w-5xl'>
                    <div className='text-center mb-8'>
                        <p
                            className='text-3xl text-emerald-700 dark:text-emerald-400 mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            أَسْمَاءُ اللهِ الْحُسْنَى
                        </p>
                        <h1 className='text-2xl font-bold text-emerald-900 dark:text-white mb-1'>
                            Asmaul Husna
                        </h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                            99 Nama Allah yang Indah beserta artinya
                        </p>
                    </div>

                    <div className='flex items-center gap-2 mb-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2'>
                        <BsSearch className='text-gray-400 shrink-0' />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Cari nama, transliterasi, atau arti...'
                            className='flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none'
                        />
                    </div>

                    <div className='grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3'>
                        {filteredNames.map((name) => (
                            <button
                                key={name.number}
                                onClick={() => setSelected(name)}
                                className='text-left p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all'
                            >
                                <div className='flex items-start justify-between mb-2'>
                                    <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full w-6 h-6 flex items-center justify-center'>
                                        {name.number}
                                    </span>
                                </div>
                                <p
                                    className='text-2xl font-bold text-emerald-900 dark:text-white mb-1 text-right'
                                    style={{ fontFamily: 'Amiri, serif' }}
                                >
                                    {name.arabic}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400 italic mb-0.5'>
                                    {name.transliteration}
                                </p>
                                <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                                    {name.indonesian}
                                </p>
                            </button>
                        ))}
                    </div>

                    {filteredNames.length === 0 && (
                        <p className='text-center text-xs text-gray-400 dark:text-gray-600 py-4'>
                            Tidak ada nama yang cocok dengan pencarian.
                        </p>
                    )}
                </div>
            </Section>

            {selected && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'
                    onClick={() => setSelected(null)}
                >
                    <div
                        className='bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 dark:border-slate-700'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='text-center mb-4'>
                            <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-3 py-1'>
                                #{selected.number}
                            </span>
                        </div>
                        <p
                            className='text-4xl font-bold text-emerald-900 dark:text-white text-center mb-2'
                            style={{ fontFamily: 'Amiri, serif' }}
                        >
                            {selected.arabic}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400 italic text-center mb-1'>
                            {selected.transliteration}
                        </p>
                        <p className='text-base font-semibold text-emerald-800 dark:text-emerald-300 text-center mb-2'>
                            {selected.indonesian}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400 text-center mb-4'>
                            {selected.english}
                        </p>
                        {selected.description && (
                            <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3'>
                                {selected.description}
                            </p>
                        )}
                        <button
                            onClick={() => setSelected(null)}
                            className='mt-5 w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors'
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
};

export default AsmaulHusnaPage;
