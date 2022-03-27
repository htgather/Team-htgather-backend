const records = []
const count = records
    .map((x) => x.videoUrl)
    .reduce((count, url) => {
        if (url) {
            count[url] ? count[url]++ : (count[url] = 1)
        }
        return count
    }, {})
const bestUrls = Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((x) => x[0])

console.log(bestUrls)