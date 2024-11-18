import styles from './layout.module.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={styles.background}>
        {children}
      </body>
    </html>
  )
} 